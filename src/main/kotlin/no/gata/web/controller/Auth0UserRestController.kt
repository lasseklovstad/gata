package no.gata.web.controller

import no.gata.web.models.GataUser
import no.gata.web.models.Responsibility
import no.gata.web.repository.GataUserRepository
import no.gata.web.repository.ResponsibilityRepository
import no.gata.web.service.Auth0RestService
import no.gata.web.models.Auth0User
import no.gata.web.models.GataRole
import no.gata.web.repository.GataRoleRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.stream.Stream


@RestController
@RequestMapping("api/auth0user")
class Auth0UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

    @GetMapping("update")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun updateInternalUsersWithExternalData() {
        auth0RestService.updateInternalUsersWithExternalData()
    }
}
