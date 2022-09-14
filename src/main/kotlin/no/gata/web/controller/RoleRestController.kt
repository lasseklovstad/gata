package no.gata.web.controller

import no.gata.web.controller.dtoOut.DtoOutGataRole
import no.gata.web.controller.dtoOut.DtoOutGataUser
import no.gata.web.service.Auth0RestService
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import no.gata.web.service.RoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
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

    @Autowired
    lateinit var roleService: RoleService


    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUserRoles(): List<DtoOutGataRole> {
        return roleRepository.findAll().map { DtoOutGataRole(it) }
    }

    @PostMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun postRole(@PathVariable roleId: String, @PathVariable userId: String): DtoOutGataUser {
        val user = gataUserRepository.findById(UUID.fromString(userId)).get()
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        val updatedUser = roleService.addRoles(user, setOf(role))
        if (updatedUser != null) {
            return DtoOutGataUser(updatedUser);
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kunne ikke oppdatere alle roller for bruker");
    }

    @DeleteMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun deleteRole(@PathVariable roleId: String, @PathVariable userId: String): DtoOutGataUser {
        val user = gataUserRepository.findById(UUID.fromString(userId)).get()
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        val updatedUser = roleService.deleteRoles(user, setOf(role))
        if (updatedUser != null) {
            return DtoOutGataUser(updatedUser);
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kunne ikke oppdatere alle roller for bruker");
    }
}
