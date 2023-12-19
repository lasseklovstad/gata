package no.gata.web.service

import no.gata.web.models.Auth0User
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.ExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.*


@Service
class Auth0RestService(private val builder: WebClient.Builder) {

    private var logger = LoggerFactory.getLogger(Auth0RestService::class.java)

    @Value(value = "\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private lateinit var issuer: String

    private var client: WebClient? = null

    // This method returns filter function which will log request data
    private fun logRequest(): ExchangeFilterFunction {
        return ExchangeFilterFunction.ofResponseProcessor() { response ->
            logger.info(
                "Request: {} {}",
                response.request().method,
                response.statusCode()
            )
            Mono.just(response)
        }
    }

    private fun getClient(): WebClient {
        if (client == null) {
            client = builder.baseUrl(issuer).filter(logRequest()).build()
        }
        return client as WebClient
    }

    fun getUserInfo(token: String): Optional<Auth0User> {
        val client = getClient();
        val response = client.get().uri("/userinfo").accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(Auth0User::class.java)
        return response.blockOptional()
    }
}
