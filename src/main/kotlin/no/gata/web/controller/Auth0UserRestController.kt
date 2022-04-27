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

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

//    @GetMapping
//    @PreAuthorize("hasAuthority('member')")
//    fun getUsers(): List<Auth0User>? {
//        return auth0RestService.getUsersWithRole();
//    }
//
//    @GetMapping("{externalUserId}")
//    @PreAuthorize("hasAuthority('member')")
//    fun getUsers(@PathVariable("externalUserId") externalUserId: String): Auth0User? {
//        return auth0RestService.getUsersWithRole()!!.find { it.userId == externalUserId };
//    }
//
//    @GetMapping("{externalUserId}/responsibility")
//    @PreAuthorize("hasAuthority('member')")
//    fun getUsersResponsibility(@PathVariable("externalUserId") userId: String): ResponseEntity<List<Responsibility>> {
//        val user = gataUserRepository.findByExternalUserProviderId(userId)
//        if (user.isPresent) {
//            return ResponseEntity(responsibilityRepository.findResponsibilityByUser(user.get()), HttpStatus.OK)
//        } else {
//            return ResponseEntity(emptyList(), HttpStatus.OK)
//        }
//    }

//    @PostMapping("{externalUserId}/responsibility/{responsibilityId}")
//    @PreAuthorize("hasAuthority('admin')")
//    fun postUsersResponsibility(
//            @PathVariable("externalUserId") userId: String,
//            @PathVariable("responsibilityId") responsibilityId: String
//    ): ResponseEntity<List<Responsibility>> {
//        val user = gataUserRepository.findByExternalUserProviderId(userId)
//        val resp = responsibilityRepository.findById(UUID.fromString(responsibilityId))
//        if (user.isPresent) {
//            val newUser = user.get()
//            newUser.responsibilities = Stream.concat(newUser.responsibilities.stream(), listOf(resp.get()).stream()).toList()
//            gataUserRepository.save(newUser)
//            return ResponseEntity(newUser.responsibilities, HttpStatus.OK)
//        } else {
//            val newUser = GataUser(id = null, externalUserProviderId = userId, responsibilities = listOf(resp.get()))
//            gataUserRepository.save(newUser)
//            return ResponseEntity(newUser.responsibilities, HttpStatus.OK)
//        }
//    }

//    @GetMapping("clearcache")
//    @PreAuthorize("hasAuthority('admin')")
//    @ResponseStatus(HttpStatus.NO_CONTENT)
//    fun clearUserCache() {
//        auth0RestService.clearUserCache();
//    }

    @GetMapping("update")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun updateInternalUsersWithExternalData() {
        val externalRoles = auth0RestService.getRoles();

        externalRoles?.forEach { externalRole ->
            run {
                val role = gataRoleRepository.findByExternalUserProviderId(externalRole.id)
                if (role.isPresent) {
                    // Update
                    val newRole = role.get()
                    newRole.name = externalRole.name
                    gataRoleRepository.save(newRole)
                } else {
                    // Create
                    gataRoleRepository.save(GataRole(
                            id = null,
                            externalUserProviderId = externalRole.id,
                            name = externalRole.name, users = null))
                }
            }
        }

        val externalUsers = auth0RestService.getUsersWithRole();
        externalUsers?.forEach { externalUser ->
            run {
                val user = gataUserRepository.findByExternalUserProviderId(externalUser.userId)
                if (user.isPresent) {
                    val newUserRoles = externalUser.roles?.map { gataRoleRepository.findByExternalUserProviderId(it.id).get() }
                            .orEmpty()
                    val updatedUser = user.get();
                    updatedUser.email = externalUser.email
                    updatedUser.picture = externalUser.picture
                    updatedUser.roles = newUserRoles as ArrayList<GataRole>
                    gataUserRepository.save(updatedUser)
                } else {
                    val newUserRoles = externalUser.roles?.map { gataRoleRepository.findByExternalUserProviderId(it.id).get() }
                            .orEmpty()
                    val newUser = GataUser(
                            id = null,
                            externalUserProviderId = externalUser.userId,
                            name = externalUser.name,
                            email = externalUser.email,
                            picture = externalUser.picture,
                            responsibilities = emptyList(),
                            roles = newUserRoles as ArrayList<GataRole>)
                    gataUserRepository.save(newUser)
                }
            }
        }
    }
}
