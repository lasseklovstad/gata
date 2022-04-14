package no.gata.web.controller

import no.gata.web.service.Auth0RestService
import no.gata.web.models.Auth0Role
import no.gata.web.models.GataRole
import no.gata.web.models.GataUser
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("api/role")
class RoleRestController {
    @Autowired
    lateinit var auth0RestService: Auth0RestService

    @Autowired
    lateinit var roleRepository: GataRoleRepository

    @Autowired
    lateinit var gataUserRepository: GataUserRepository


    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(): List<GataRole> {
        return roleRepository.findAll();
    }

    @PostMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun postRole(@PathVariable roleId:String, @PathVariable userId: String): GataUser {
        val user = gataUserRepository.findById(UUID.fromString(userId)).get()
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        val response = auth0RestService.updateRole(user.externalUserProviderId, listOf(role.externalUserProviderId), HttpMethod.POST);
        if(response?.statusCode == HttpStatus.NO_CONTENT){
            user.roles = user.roles.plus(role)
            return gataUserRepository.save(user)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke bruker");
    }

    @DeleteMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun deleteRole(@PathVariable roleId:String, @PathVariable userId: String): GataUser {
        val user = gataUserRepository.findById(UUID.fromString(userId)).get()
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        val response = auth0RestService.updateRole(user.externalUserProviderId, listOf(role.externalUserProviderId), HttpMethod.DELETE);
        if(response?.statusCode == HttpStatus.NO_CONTENT){
            user.roles = user.roles.minus(role)
            return gataUserRepository.save(user)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke bruker");
    }
}
