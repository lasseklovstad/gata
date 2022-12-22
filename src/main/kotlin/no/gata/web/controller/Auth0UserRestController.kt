package no.gata.web.controller

import no.gata.web.controller.dtoOut.DtoOutExternalUser
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.service.Auth0RestService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("api/auth0user")
class Auth0UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService
    @Autowired
    private lateinit var externalUserRepository: ExternalUserRepository

    @GetMapping("update")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun updateInternalUsersWithExternalData() {
        auth0RestService.updateInternalUsersWithExternalData()
    }

    @GetMapping("nogatauser")
    @PreAuthorize("hasAuthority('member')")
    fun getExternalUsersWithNoGataUser(authentication: Authentication): List<DtoOutExternalUser> {
        val isAdmin = authentication.authorities.find { it.authority == "admin" } != null
        if(isAdmin){
            return externalUserRepository.findAllByUserIsNull().map { DtoOutExternalUser(it) }
        }
        return emptyList()
    }
}
