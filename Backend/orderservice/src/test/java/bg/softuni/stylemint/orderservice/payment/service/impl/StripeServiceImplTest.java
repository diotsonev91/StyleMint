package bg.softuni.stylemint.orderservice.payment.service.impl;

import bg.softuni.stylemint.orderservice.payment.service.StripeService;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceImplTest {

    @Test
    void createCheckoutSession_success_returnsSessionUrl() throws Exception {
        // arrange
        StripeService stripeService = new StripeServiceImpl("test-secret-key");

        Session mockSession = mock(Session.class);
        when(mockSession.getUrl()).thenReturn("https://stripe.test/session-url");

        try (MockedStatic<Session> sessionMock = mockStatic(Session.class)) {
            sessionMock.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenReturn(mockSession);

            UUID orderId = UUID.randomUUID();

            // act
            String url = stripeService.createCheckoutSession(100.0, orderId,
                    "https://success", "https://cancel");

            // assert
            assertEquals("https://stripe.test/session-url", url);
            sessionMock.verify(() -> Session.create(any(SessionCreateParams.class)), times(1));
        }
    }

}
