package no.gata.web.controller

import no.gata.web.controller.dtoOut.DtoOutGataRole
import no.gata.web.repository.GataRoleRepository
import no.gata.web.service.GataUserService
import no.gata.web.service.RoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("api/role")
class RoleRestController {
    @Autowired
    lateinit var roleRepository: GataRoleRepository

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var gataUserService: GataUserService

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUserRoles(): List<DtoOutGataRole> {
        return roleRepository.findAll().map { DtoOutGataRole(it) }
    }

    @PostMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun postRole(
        @PathVariable roleId: String,
        @PathVariable userId: String,
    ) {
        val user = gataUserService.getUser(userId)
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        roleService.addRoles(user, setOf(role))
    }

    @DeleteMapping("{roleId}/user/{userId}")
    @PreAuthorize("hasAuthority('admin')")
    fun deleteRole(
        @PathVariable roleId: String,
        @PathVariable userId: String,
    ) {
        val user = gataUserService.getUser(userId)
        val role = roleRepository.findById(UUID.fromString(roleId)).get()
        roleService.deleteRoles(user, setOf(role))
    }
}
