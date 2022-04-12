package no.gata.web.controller

import no.gata.web.service.Auth0RestService
import no.gata.web.service.Auth0Role
import no.gata.web.service.Auth0User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("api/role")
class RoleRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService


    @GetMapping
    fun getUsers(): Array<Auth0Role>? {
        return auth0RestService.getRoles();
    }

    @GetMapping("{id}/users")
    fun getUsers(@PathVariable("id") userId: String): Array<Auth0User>? {
        return auth0RestService.getUsers(userId);
    }
}
