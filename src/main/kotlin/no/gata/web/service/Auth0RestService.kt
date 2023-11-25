package no.gata.web.service

import no.gata.web.models.*
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.Duration
import java.time.Instant
import java.util.*


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
    private lateinit var externalUserRepository: ExternalUserRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    private var client: WebClient? = null
    private var token: String? = null
    private var tokenExpiryTime: Instant? = null

    private fun getToken(): String {
        if (token == null || tokenExpiryTime == null || Instant.now().isAfter(tokenExpiryTime)) {
            refreshToken()
        }
        return token!!
    }

    private fun refreshToken() {
        val client = builder.baseUrl(issuer).filter(logRequest()).build()
        val audience = issuer + "api/v2/";

        val body = Auth0TokenPayload(clientId, clientSecret, audience, "client_credentials")
        val newToken =
            client.post().uri("/oauth/token").accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .retrieve().toEntity(Auth0Token::class.java)
                .delayElement(Duration.ofMillis(500))
                .block();
        val tokenBody = newToken?.body
        if (tokenBody != null) {
            token = tokenBody.access_token
            tokenExpiryTime = Instant.now().plusSeconds(tokenBody.expires_in.toLong())
        }
    }

    // This method returns filter function which will log request data
    private fun logRequest(): ExchangeFilterFunction {
        return ExchangeFilterFunction.ofRequestProcessor { clientRequest ->
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

    private fun getUsers(token: String): Optional<Array<Auth0User>> {
        val client = getClient();
        val response = client.get().uri("/api/v2/users").accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(Array<Auth0User>::class.java)
            .delayElement(Duration.ofSeconds(1))
            .onErrorResume { throwable ->
                logger.error("Feil ved henting av brukere", throwable)
                Mono.just(
                    emptyArray()
                )
            }
        return response.blockOptional()
    }

    private fun getRoles(): Optional<Array<Auth0Role>> {
        val client = getClient();
        val token = getToken();
        val response = client.get().uri("/api/v2/roles").accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(Array<Auth0Role>::class.java)
            .delayElement(Duration.ofSeconds(1))
            .onErrorResume { throwable ->
                logger.error("Feil ved henting av roller", throwable)
                Mono.just(
                    emptyArray()
                )
            }
        return response.blockOptional()
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
        val response = client.get().uri("/api/v2/users/${userId}/roles").accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .bodyToMono(Array<Auth0Role>::class.java)
            .delayElement(Duration.ofSeconds(1))
            .onErrorResume { throwable ->
                logger.error("Feil ved henting av bruker roller", throwable)
                Mono.just(
                    emptyArray()
                )
            }
        return response.block()
    }

    private fun getUsersWithRole(): List<Auth0User> {
        val token = getToken();
        return getUsers(token).map { user ->
            user.map {
                val roles = getUserRole(it.userId, token)
                Auth0User(it.name, it.email, it.picture, it.userId, roles?.toList(), it.lastLogin)
            }
        }.orElse(emptyList())
    }

    @Scheduled(cron = "0 0 1 * * ?")
    fun updateInternalUsersWithExternalData() {

        // Updates Roles in db if a new one is created from auth0 or database is empty
        logger.info("Fetch all external auth0 roles and update")
        getRoles().map {
            it.map { externalRole ->
                gataRoleRepository
                    .findByExternalUserProviderId(externalRole.id)
                    .ifPresentOrElse({ role ->
                        // Update
                        role.name = externalRole.name
                        gataRoleRepository.save(role)
                    }, {
                        // Create
                        gataRoleRepository.save(
                            GataRole(
                                id = null,
                                externalUserProviderId = externalRole.id,
                                name = externalRole.name, users = emptyList()
                            )
                        )
                    })
            }
        }

        // Update users from auth0
        logger.info("Fetch all external auth0 users and update")
        getUsersWithRole().forEach { externalUser ->
            externalUserRepository.findById(externalUser.userId).ifPresentOrElse({ user ->
                // Update external user values
                user.apply {
                    email = externalUser.email
                    picture = externalUser.picture
                    lastLogin = externalUser.lastLogin
                }
                externalUserRepository.save(user)

                if (externalUser.roles?.isNotEmpty() == true) {
                    gataUserRepository.findByExternalUserProvidersId(externalUser.userId).ifPresent { gataUser ->
                        // If user exists update roles from auth0
                        val externalUserRoles = externalUser.roles!!
                            .map { role -> gataRoleRepository.findByExternalUserProviderId(role.id) }
                            .filter { it.isPresent }.map { it.get() }
                        gataUser.roles = externalUserRoles
                        gataUserRepository.save(gataUser)
                    }
                }

            }, {
                val newExternalUser = ExternalUser(
                    id = externalUser.userId,
                    name = externalUser.name,
                    email = externalUser.email,
                    picture = externalUser.picture,
                    lastLogin = externalUser.lastLogin,
                    user = null, primary = false
                )
                if (externalUser.roles?.isNotEmpty() == true) {
                    // If the user from auth0 has roles create a gata user with those roles
                    val gataUser = GataUser()
                    gataUser.roles = externalUser.roles!!
                        .map { gataRoleRepository.findByExternalUserProviderId(it.id) }
                        .filter { it.isPresent }
                        .map { it.get() }
                    gataUserRepository.save(gataUser)
                    newExternalUser.apply {
                        primary = true
                        user = gataUser
                    }
                    externalUserRepository.save(newExternalUser)
                } else {
                    externalUserRepository.save(newExternalUser)
                }
            })
        }
        logger.info("Done syncing users from auth0")
    }


}
