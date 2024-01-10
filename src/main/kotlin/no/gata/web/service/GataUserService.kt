package no.gata.web.service

import no.gata.web.exception.ExternalUserNotFound
import no.gata.web.exception.GataUserNotFound
import no.gata.web.models.ExternalUser
import no.gata.web.models.GataUser
import no.gata.web.models.UserRoleName
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.jvm.optionals.getOrElse

@Service
class GataUserService {
    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var auth0RestService: Auth0RestService

    @Autowired
    private lateinit var externalUserRepository: ExternalUserRepository

    @Autowired
    private lateinit var gataRoleService: RoleService

    fun getUser(id: String): GataUser {
        return gataUserRepository.findById(UUID.fromString(id)).orElseThrow { GataUserNotFound(id) }
    }

    fun findExternalUser(externalUserId: String): ExternalUser {
        return externalUserRepository
            .findById(externalUserId)
            .orElseThrow { ExternalUserNotFound(externalUserId) }
    }

    fun findOrCreateNewExternalUser(authentication: JwtAuthenticationToken): ExternalUser {
        return externalUserRepository
            .findById(authentication.name)
            .getOrElse {
                // save external user if it doesn't exist in database
                createNewExternalUser(authentication)
            }
    }

    fun createNewExternalUser(authentication: JwtAuthenticationToken): ExternalUser {
        val auth0User = auth0RestService.getUserInfo(authentication.token.tokenValue)
            .orElseThrow { ExternalUserNotFound(authentication.name) }
        val newExternalUser = ExternalUser(
            id = auth0User.userId,
            name = auth0User.name,
            email = auth0User.email,
            picture = auth0User.picture,
            lastLogin = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
            user = null, primary = false
        )
        return externalUserRepository
            .findById(authentication.name)
            .getOrElse {
                externalUserRepository.save(newExternalUser)
            }
    }

    fun createNewGataUser(externalUser: ExternalUser, userRoleName: UserRoleName?) {

        val newGataUser = gataUserRepository.save(
            if (userRoleName == null) GataUser() else GataUser(
                gataRoleService.getRole(userRoleName)
            )
        )
        externalUser.user = newGataUser
        externalUser.primary = true
        externalUserRepository.save(externalUser)
    }

    fun getLoggedInUser(authentication: JwtAuthenticationToken): GataUser {
        return gataUserRepository.findByExternalUserProvidersId(authentication.name)
            .orElseThrow { GataUserNotFound(authentication.name) }
    }

    fun getAllMembers(): List<GataUser> {
        val role = gataRoleService.getMemberRole()
        return gataUserRepository.findAllByRolesEquals(role)
    }

    fun getAllAdmins(): List<GataUser> {
        val role = gataRoleService.getAdminRole()
        return gataUserRepository.findAllByRolesEquals(role)
    }
}
