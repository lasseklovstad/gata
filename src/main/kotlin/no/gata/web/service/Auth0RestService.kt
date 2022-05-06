package no.gata.web.service

import no.gata.web.models.*
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.ArrayList


@Service
class Auth0RestService(private val builder: WebClient.Builder) {

    private var logger = LoggerFactory.getLogger(Auth0RestService::class.java)

    @Value(value = "\${auth0.client-id}")
    private lateinit var clientId: String

    @Value(value = "\${auth0.client-secret}")
    private lateinit var clientSecret: String

    @Value(value = "\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private lateinit var issuer: String

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    private var client: WebClient? = null

    private fun getToken(): String {
        val client = builder.baseUrl(issuer).filter(logRequest()).build()
        val audience = issuer + "api/v2/";

        val body = Auth0TokenPayload(clientId, clientSecret, audience, "client_credentials")
        val token = client.post().uri("/oauth/token").accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_JSON).body(BodyInserters.fromValue(body))
                .retrieve().toEntity(Auth0Token::class.java).block();
        return token!!.body!!.access_token
    }

    // This method returns filter function which will log request data
    private fun logRequest(): ExchangeFilterFunction {
        return ExchangeFilterFunction.ofRequestProcessor { clientRequest: ClientRequest ->
            logger.info("Request: {} {}", clientRequest.method(), clientRequest.url())
            Mono.just(clientRequest)
        }
    }

    private fun getClient(): WebClient {
        if (client == null) {
            client = builder.baseUrl(issuer).filter(logRequest()).build()
        }
        return client as WebClient
    }

    private fun getUsers(token: String): Array<Auth0User>? {
        val client = getClient();
        val response = client.get().uri("/api/v2/users").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0User>::class.java);
        return response.block()
    }

    private fun getRoles(): Array<Auth0Role>? {
        val client = getClient();
        val token = getToken();
        val response = client.get().uri("/api/v2/roles").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0Role>::class.java);
        return response.block()
    }

    fun updateRole(userId: String, roles: List<String>, method: HttpMethod): ResponseEntity<Void>? {

        val client = getClient();
        val token = getToken();
        return client.method(method).uri("/api/v2/users/${userId}/roles")
                .body(BodyInserters.fromValue(Auth0RolePayload(roles)))
                .accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer ${token}")
                .retrieve().toBodilessEntity().block();

    }

    private fun getUserRole(userId: String, token: String): Array<Auth0Role>? {
        val client = getClient();
        val response = client.get().uri("/api/v2/users/${userId}/roles").accept(MediaType.APPLICATION_JSON).header("Authorization", "Bearer " + token)
                .retrieve().bodyToMono(Array<Auth0Role>::class.java);
        return response.block()
    }

    private fun getUsersWithRole(): List<Auth0User>? {
        logger.info("Fetching users from auth0")
        val token = getToken();
        val usersWithoutRole = getUsers(token);
        return usersWithoutRole!!.map {
            val roles = getUserRole(it.userId, token)
            Auth0User(it.name, it.email, it.picture, it.userId, roles?.toList())
        }
    }

    fun updateInternalUsersWithExternalData() {
        val externalRoles = getRoles();

        externalRoles?.forEach { externalRole ->
            run {
                val role = gataRoleRepository.findByExternalUserProviderId(externalRole.id)
                if (role.isPresent) {
                    // Update
                    val newRole = role.get()
                    newRole.name = externalRole.name
                    gataRoleRepository.save(newRole)
                } else {
                    // Create
                    gataRoleRepository.save(GataRole(
                            id = null,
                            externalUserProviderId = externalRole.id,
                            name = externalRole.name, users = null))
                }
            }
        }

        val externalUsers = getUsersWithRole();
        externalUsers?.forEach { externalUser ->
            run {
                val user = gataUserRepository.findByExternalUserProviderId(externalUser.userId)
                if (user.isPresent) {
                    val newUserRoles = externalUser.roles?.map { gataRoleRepository.findByExternalUserProviderId(it.id).get() }
                            .orEmpty()
                    val updatedUser = user.get();
                    updatedUser.email = externalUser.email
                    updatedUser.picture = externalUser.picture
                    updatedUser.roles = newUserRoles as ArrayList<GataRole>
                    gataUserRepository.save(updatedUser)
                } else {
                    val newUserRoles = externalUser.roles?.map { gataRoleRepository.findByExternalUserProviderId(it.id).get() }
                            .orEmpty()
                    val newUser = GataUser(
                            id = null,
                            externalUserProviderId = externalUser.userId,
                            name = externalUser.name,
                            email = externalUser.email,
                            picture = externalUser.picture,
                            responsibilities = emptyList(),
                            roles = newUserRoles as ArrayList<GataRole>)
                    gataUserRepository.save(newUser)
                }
            }
        }
    }


}
