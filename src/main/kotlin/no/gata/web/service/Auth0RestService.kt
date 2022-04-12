package no.gata.web.service

import com.fasterxml.jackson.annotation.JsonProperty
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.function.Consumer


class Auth0User(
        var name: String,
        var email: String,
        var picture: String,
        @JsonProperty("user_id")
        var userId: String,
)

class Auth0Role(
        var id: String,
        var name: String,
        var description: String,
)

class Auth0TokenPayload(
        var client_id: String,
        var client_secret: String,
        var audience: String,
        var grant_type: String,
)

class Auth0TokenResponseBody(
        var access_token: String,
        var scope: String,
        var expires_in: Int,
        var token_type: String,
)

@Service
class Auth0RestService(private val builder: WebClient.Builder) {

    var logger = LoggerFactory.getLogger(Auth0RestService::class.java)

    @Value(value = "\${auth0.client-id}")
    private lateinit var clientId: String

    @Value(value = "\${auth0.client-secret}")
    private lateinit var clientSecret: String

    @Value(value = "\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private lateinit var issuer: String

    fun getToken(): String {
        val client = builder.baseUrl(issuer).filter(logRequest()).build()
        val audience = issuer + "api/v2/";

        val body = Auth0TokenPayload(clientId, clientSecret, audience, "client_credentials")
        val token = client.post().uri("/oauth/token").accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_JSON).body(BodyInserters.fromValue(body))
                .retrieve().toEntity(Auth0TokenResponseBody::class.java).block();
        return token!!.body!!.access_token
    }

    // This method returns filter function which will log request data
    private fun logRequest(): ExchangeFilterFunction {
        return ExchangeFilterFunction.ofRequestProcessor { clientRequest: ClientRequest ->
            logger.info("Request: {} {}", clientRequest.method(), clientRequest.url())
            clientRequest.headers().forEach { name: String?, values: List<String?> -> values.forEach(Consumer { value: String? -> logger.info("{}={}", name, value) }) }
            Mono.just(clientRequest)
        }
    }

    private fun getClient(): WebClient {
        return builder.baseUrl(issuer).filter(logRequest()).build()
    }

    fun getUsers(): Array<Auth0User>? {
        val token = getToken();
        val client = getClient();
        val response = client.get().uri("/api/v2/users").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0User>::class.java);
        return response.block()
    }

    fun getUsers(roleId: String): Array<Auth0User>? {
        val token = getToken();
        val client = getClient();
        val response = client.get().uri("/api/v2/roles/"+roleId+"/users").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0User>::class.java);
        return response.block()
    }

    fun getRoles(): Array<Auth0Role>? {
        val token = getToken();
        val client = getClient();
        val response = client.get().uri("/api/v2/roles").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0Role>::class.java);
        return response.block()
    }
}
