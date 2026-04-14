package za.co.triviabattle.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

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
            // Always approve for now; add inventory checks here
            return answerPreCheckoutQuery(queryId, true, null)
                    .thenReturn(Map.of("ok", true));
        }

        if (update.containsKey("message")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) update.get("message");
            if (message.containsKey("successful_payment")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> payment = (Map<String, Object>) message.get("successful_payment");
                String productType = (String) payment.get("invoice_payload");
                String userId = String.valueOf(
                        ((Map<?, ?>) update.get("message")).get("from"));
                log.info("[Payment] Stars payment received: product={} user={}", productType, userId);
                // TODO: credit the power-up to the user in MySQL
            }
        }

        return Mono.just(Map.of("ok", true));
    }

    private Mono<Void> answerPreCheckoutQuery(String queryId, boolean ok, String errorMessage) {
        Map<String, Object> body = ok
                ? Map.of("pre_checkout_query_id", queryId, "ok", true)
                : Map.of("pre_checkout_query_id", queryId, "ok", false, "error_message", errorMessage);

        return webClientBuilder.build()
                .post()
                .uri("https://api.telegram.org/bot{token}/answerPreCheckoutQuery", botToken)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class);
    }

    // ── Inner types ───────────────────────────────────────────────────────────

    record TelegramApiResponse(boolean ok, String result) {}

    enum Product {
        INK_BLOT_PACK("Ink Blot ×3", "Sabotage 3 opponents' screens", 25),
        FREEZE_PACK   ("Freeze ×2",   "Stop opponents' timers",        30),
        DOUBLE_PACK   ("2× Points ×2","Double your score this round",  40);

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
                case "INK_BLOT_PACK" -> INK_BLOT_PACK;
                case "FREEZE_PACK"   -> FREEZE_PACK;
                case "DOUBLE_PACK"   -> DOUBLE_PACK;
                default              -> throw new IllegalArgumentException("Unknown product: " + type);
            };
        }
    }
}
