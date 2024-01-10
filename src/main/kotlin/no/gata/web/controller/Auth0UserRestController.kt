package no.gata.web.controller

import no.gata.web.controller.dtoOut.DtoOutExternalUser
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.service.GataUserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("api/auth0user")
class Auth0UserRestController {
    @Autowired
    private lateinit var externalUserRepository: ExternalUserRepository

    @Autowired
    private lateinit var gataUserService: GataUserService

    @GetMapping("nogatauser")
    @PreAuthorize("hasAuthority('member')")
    fun getExternalUsersWithNoGataUser(authentication: JwtAuthenticationToken): List<DtoOutExternalUser> {
        val isAdmin = gataUserService.getLoggedInUser(authentication).getIsUserAdmin()
        if (isAdmin) {
            return externalUserRepository.findAllByUserIsNull().map { DtoOutExternalUser(it) }
        }
        return emptyList()
    }
}
