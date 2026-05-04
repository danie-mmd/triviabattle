package za.co.triviabattle.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import za.co.triviabattle.users.UserRepository;

/**
 * PaymentController
 *
 * Handles two payment flows:
 *  1. Telegram Stars – createInvoiceLink via Bot API → openInvoice() on the frontend
 *  2. Stars webhook  – processes pre_checkout_query + successful_payment updates
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${app.bot-token}")
    private String botToken;

    private final WebClient.Builder webClientBuilder;
    private final UserRepository userRepository;

    // ── Stars: create invoice ─────────────────────────────────────────────────

    /**
     * POST /api/payments/stars/invoice
     * Body: { "productType": "INK_BLOT_PACK" }
     *
     * Calls the Telegram Bot API to create a Stars invoice link.
     */
    @PostMapping("/stars/invoice")
    public Mono<Map<String, String>> createStarsInvoice(@RequestBody Map<String, String> body) {
        String productType = body.getOrDefault("productType", "UNKNOWN");
        Product product = Product.fromType(productType);

        // https://core.telegram.org/bots/api#createinvoicelink
        Map<String, Object> invoicePayload = Map.of(
                "title",           product.title(),
                "description",     product.description(),
                "payload",         productType,
                "currency",        "XTR",          // Telegram Stars currency code
                "prices",          new Object[]{ Map.of("label", product.title(), "amount", product.starAmount()) },
                "provider_token",  ""              // Empty string for Stars payments
        );

        return webClientBuilder.build()
                .post()
                .uri("https://api.telegram.org/bot{token}/createInvoiceLink", botToken)
                .bodyValue(invoicePayload)
                .retrieve()
                .bodyToMono(TelegramApiResponse.class)
                .map(r -> Map.of("invoiceLink", r.result()))
                .doOnError(e -> log.error("[Payment] createInvoiceLink failed for {}", productType, e));
    }

    // ── Stars: webhook ────────────────────────────────────────────────────────

    /**
     * POST /api/payments/stars/webhook
     * Telegram sends pre_checkout_query and successful_payment updates here.
     */
    @PostMapping("/stars/webhook")
    public Mono<Map<String, Object>> handleWebhook(@RequestBody Map<String, Object> update) {
        log.debug("[Payment] Webhook update: {}", update);

        if (update.containsKey("pre_checkout_query")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> pcq = (Map<String, Object>) update.get("pre_checkout_query");
            String queryId = (String) pcq.get("id");
            
            log.info("[Payment] Answering pre_checkout_query {} via explicit API call", queryId);
            
            return webClientBuilder.build()
                    .post()
                    .uri("https://api.telegram.org/bot{token}/answerPreCheckoutQuery", botToken)
                    .bodyValue(Map.of(
                            "pre_checkout_query_id", queryId,
                            "ok", true
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .doOnSuccess(res -> log.info("[Payment] PreCheckoutQuery answered: {}", res))
                    .then(Mono.just(Map.of("ok", true)));
        }

        if (update.containsKey("message")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) update.get("message");
            if (message.containsKey("successful_payment")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> payment = (Map<String, Object>) message.get("successful_payment");
                String productType = (String) payment.get("invoice_payload");
                @SuppressWarnings("unchecked")
                Map<String, Object> from = (Map<String, Object>) message.get("from");
                Number userIdNum = (Number) from.get("id");
                
                log.info("[Payment] Stars payment received: product={} user={}", productType, userIdNum);

                if (userIdNum != null) {
                    Product product = Product.fromType(productType);
                    return Mono.fromCallable(() -> {
                        return userRepository.findById(userIdNum.longValue()).map(user -> {
                            user.setStarsBalance(user.getStarsBalance() + product.starAmount());
                            userRepository.save(user);
                            log.info("[Payment] Credited {} stars to user {}", product.starAmount(), userIdNum);
                            return user;
                        });
                    }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                    .then(Mono.just(Map.of("ok", true)));
                }
            }
        }

        return Mono.just(Map.of("ok", true));
    }

    // ── Inner types ───────────────────────────────────────────────────────────

    record TelegramApiResponse(boolean ok, String result) {}

    enum Product {
        STARS_1("1 Star", "Test pack of stars", 1),
        STARS_25("25 Stars", "Small pack of stars", 25),
        STARS_50("50 Stars", "Medium pack of stars", 50),
        STARS_100("100 Stars", "Large pack of stars", 100);

        private final String title;
        private final String description;
        private final int    starAmount;

        Product(String title, String description, int starAmount) {
            this.title       = title;
            this.description = description;
            this.starAmount  = starAmount;
        }

        String title()       { return title; }
        String description() { return description; }
        int    starAmount()  { return starAmount; }

        static Product fromType(String type) {
            return switch (type) {
                case "STARS_1"  -> STARS_1;
                case "STARS_25" -> STARS_25;
                case "STARS_50" -> STARS_50;
                case "STARS_100" -> STARS_100;
                default         -> throw new IllegalArgumentException("Unknown product: " + type);
            };
        }
    }
}
