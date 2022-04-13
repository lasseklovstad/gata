package no.gata.web.controller

import no.gata.web.service.Auth0RestService
import no.gata.web.service.Auth0User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.CacheEvict
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("api/user")
class UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

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

    @GetMapping("clearcache")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun clearUserCache() {
        auth0RestService.clearUserCache();
    }
}
