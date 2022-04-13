package no.gata.web.controller

import no.gata.web.service.Auth0RestService
import no.gata.web.service.Auth0Role
import no.gata.web.service.Auth0User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

data class PostRoleBody(
        val userId: String,
        val roles: List<String>
)

@RestController
@RequestMapping("api/role")
class RoleRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService


    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(): Array<Auth0Role>? {
        return auth0RestService.getRoles();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postRole(@RequestBody body: PostRoleBody): ResponseEntity<Void>? {
        return auth0RestService.updateRole(body.userId, body.roles, HttpMethod.POST);
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('admin')")
    fun deleteRole(@RequestBody body: PostRoleBody): ResponseEntity<Void>? {
        return auth0RestService.updateRole(body.userId, body.roles, HttpMethod.DELETE);
    }
}
