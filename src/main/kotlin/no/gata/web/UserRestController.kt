package no.gata.web

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("api/user")
class UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

    @GetMapping
    @PreAuthorize("hasAuthority('read:user')")
    fun getUsers(): Array<Auth0User>? {
        return auth0RestService.getUsers();
    }
}
