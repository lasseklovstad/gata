package no.gata.web

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("api/user")
class UserRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

    @GetMapping
    fun getUsers(): Array<Auth0User>? {
        return auth0RestService.getUsers();
    }
}
