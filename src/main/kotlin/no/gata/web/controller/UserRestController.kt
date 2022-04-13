package no.gata.web.controller

import no.gata.web.models.Responsibility
import no.gata.web.repoistory.GataUserResponsibility
import no.gata.web.repoistory.ResponsibilityRepository
import no.gata.web.service.Auth0RestService
import no.gata.web.service.Auth0User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*


@RestController
@RequestMapping("api/user")
class UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var gataUserResponsibility: GataUserResponsibility

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(): List<Auth0User>? {
        return auth0RestService.getUsersWithRole();
    }

    @GetMapping("{userId}")
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(@PathVariable("userId") userId: String): Auth0User? {
        val users = auth0RestService.getUsersWithRole();
        return users!!.find { it.userId == userId }
    }

    @GetMapping("{userId}/responsibility")
    @PreAuthorize("hasAuthority('member')")
    fun getUsersResponsibility(@PathVariable("userId") userId: String): ResponseEntity<List<Responsibility>> {
        val user = gataUserResponsibility.findByExternalUserProviderId(userId)
        if (user.isPresent) {
            return ResponseEntity(responsibilityRepository.findResponsibilityByUser(user.get()), HttpStatus.OK)
        } else {
            return ResponseEntity(emptyList(), HttpStatus.OK)
        }
    }

    @GetMapping("clearcache")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun clearUserCache() {
        auth0RestService.clearUserCache();
    }
}
