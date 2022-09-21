package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnContingent
import no.gata.web.controller.dtoInn.DtoInnGataUser
import no.gata.web.controller.dtoInn.DtoInnResponsibilityNote
import no.gata.web.controller.dtoInn.DtoInnResponsibilityYear
import no.gata.web.controller.dtoOut.DtoOutGataContingent
import no.gata.web.controller.dtoOut.DtoOutGataUser
import no.gata.web.controller.dtoOut.DtoOutResponsibilityYear
import no.gata.web.exception.ExternalUserNotFound
import no.gata.web.exception.GataUserNoSufficientRole
import no.gata.web.exception.GataUserNotFound
import no.gata.web.models.GataContingent
import no.gata.web.models.GataUser
import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import no.gata.web.repository.*
import no.gata.web.service.GataReportService
import no.gata.web.service.GataUserService
import no.gata.web.service.RoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("api/user")
class GataUserRestController {
    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var responsibilityYearRepository: ResponsibilityYearRepository

    @Autowired
    private lateinit var responsibilityNoteRepository: ResponsibilityNoteRepository

    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    @Autowired
    private lateinit var gataContingentRepository: GataContingentRepository

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var externalUserRepository: ExternalUserRepository

    @Autowired
    lateinit var gataUserService: GataUserService

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(authentication: Authentication): List<DtoOutGataUser> {
        val isAdmin = authentication.authorities.find { it.authority.equals("admin") }
        if (isAdmin != null) {
            return gataUserRepository.findAll().map { DtoOutGataUser(it) }
        }
        val role = gataRoleRepository.findByName("Medlem")
        return gataUserRepository.findAllByRolesEquals(role.get()).map { DtoOutGataUser(it) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postUser(@RequestBody body: DtoInnGataUser): DtoOutGataUser {
        val externalUser = externalUserRepository
                .findById(body.externalUserId)
                .orElseThrow { ExternalUserNotFound(body.externalUserId) }
        val newGataUser = gataUserRepository.save(GataUser())
        externalUser.user = newGataUser
        externalUser.primary = true
        externalUserRepository.save(externalUser)
        newGataUser.externalUserProviders = listOf(externalUser)
        return DtoOutGataUser(newGataUser)
    }

    @GetMapping("loggedin")
    @PreAuthorize("hasAuthority('member')")
    fun getLoggedInUser(authentication: Authentication): DtoOutGataUser {
        val user = gataUserRepository.findByExternalUserProvidersId(authentication.name).orElseThrow { GataUserNotFound(authentication.name) }
        return DtoOutGataUser(user)
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getUser(@PathVariable id: String): DtoOutGataUser? {
        return DtoOutGataUser(gataUserService.getUser(id))
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: String) {
        val gatUser = gataUserService.getUser(id)
        // Remove all roles
        val roles = gataRoleRepository.findAll()
        roleService.deleteRoles(gatUser, roles.toSet())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kunne ikke oppdatere alle roller for bruker")
        // Remove link to external user
        gatUser.externalUserProviders = gatUser.externalUserProviders.map {
            it.user = null
            it.primary = false
            it
        }
        gataUserRepository.save(gatUser)
        // Delete user
        gataUserRepository.delete(gatUser)
    }

    @GetMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilitiesByUserId(@PathVariable id: String): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
    }

    private fun validateUserIsMember(user: GataUser) {
        if (user.getIsUserMember()) {
            return
        } else {
            throw GataUserNoSufficientRole("medlem")
        }
    }

    @DeleteMapping("{id}/responsibilityyear/{responsibilityYearId}")
    @PreAuthorize("hasAuthority('admin')")
    fun removeResponseibilityForUser(@PathVariable responsibilityYearId: String, @PathVariable id: String): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        validateUserIsMember(user)
        val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
        val note = responsibilityYear.note
        if (note != null) {
            responsibilityNoteRepository.delete(note)
        }
        responsibilityYearRepository.delete(responsibilityYear)

        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }

    }

    @PostMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('admin')")
    fun createResponsibilityForUser(@PathVariable id: String, @RequestBody responsibilityYearPayload: DtoInnResponsibilityYear): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        val year = responsibilityYearPayload.year;
        validateUserIsMember(user)
        val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityYearPayload.responsibilityId)).get()
        val responsibilityYearCheck = responsibilityYearRepository.findResponsibilityYearsByUserAndYearAndResponsibility(user, year, responsibility)
        if (responsibilityYearCheck.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker har allerede denne ansvarsposten for dette året.")
        }


        val responsibilityYear = ResponsibilityYear(id = null, year = year, user = user, responsibility = responsibility, note = null)
        val note = ResponsibilityNote(id = null, lastModifiedDate = Date(), lastModifiedBy = user.getPrimaryUser()!!.name, text = "", responsibilityYear = responsibilityYear)
        responsibilityYear.note = note
        responsibilityYearRepository.save(responsibilityYear);

        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }

    }

    @PutMapping("{id}/responsibilityyear/{responsibilityYearId}/note")
    @PreAuthorize("hasAuthority('member')")
    fun updateResponsibilityNote(@PathVariable responsibilityYearId: String,
                                 @PathVariable id: String, authentication: Authentication,
                                 @RequestBody noteBody: DtoInnResponsibilityNote): DtoOutResponsibilityYear {
        val user = gataUserService.getUser(id)
        val loggedInUser = getLoggedInUser(authentication)
        val isAdmin = authentication.authorities.find { it.authority == "admin" } != null
        if (loggedInUser.id != user.id.toString() && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du kan ikke endre på noen andre sine ansvarsposter!");
        }

        validateUserIsMember(user)
        val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
        responsibilityYear.note?.update(user, noteBody.text)
        return DtoOutResponsibilityYear(responsibilityYearRepository.save(responsibilityYear))

    }

    @PostMapping("{id}/contingent")
    @PreAuthorize("hasAuthority('admin')")
    fun postContingent(@PathVariable id: String, @RequestBody body: DtoInnContingent): List<DtoOutGataContingent> {
        val user = gataUserService.getUser(id)
        validateUserIsMember(user)
        val existingContingentOptional = gataContingentRepository.findByUserAndYear(user, body.year)

        if (existingContingentOptional.isPresent) {
            val existingContingent = existingContingentOptional.get()
            existingContingent.isPaid = body.isPaid
            gataContingentRepository.save(existingContingent)
        } else {
            val contingent = GataContingent(id = null, year = body.year, isPaid = body.isPaid, user)
            gataContingentRepository.save(contingent)
        }
        return gataContingentRepository.findAllByUser(user).map { DtoOutGataContingent(it) }

    }

    @PutMapping("{id}/subscribe")
    @PreAuthorize("hasAuthority('member')")
    fun updateSubscribe(@PathVariable id: String): DtoOutGataUser {
        val user = gataUserService.getUser(id)
        user.subscribe = !user.subscribe
        return DtoOutGataUser(gataUserRepository.save(user))
    }

    @PutMapping("{id}/externaluserproviders")
    @PreAuthorize("hasAuthority('admin')")
    fun updateExternalUserProviders(@PathVariable id: String, @RequestBody externalUserProviderIds: List<String>): DtoOutGataUser {
        val user = gataUserService.getUser(id)
        val removeExternalUserProviders = user.externalUserProviders.filter { !externalUserProviderIds.contains(it.id) }.onEach { it.user = null }
        val externalUserProviders = externalUserRepository.findAllById(externalUserProviderIds).onEach { it.user = user }
        roleService.deleteRoles(removeExternalUserProviders, user.roles)
        roleService.addRoles(externalUserProviders, user.roles)
        externalUserRepository.saveAll(removeExternalUserProviders)
        user.externalUserProviders = externalUserProviders
        return DtoOutGataUser(gataUserRepository.save(user))
    }

    @PutMapping("{id}/primaryuser")
    @PreAuthorize("hasAuthority('admin')")
    fun updatePrimaryExternalUser(@PathVariable id: String, @RequestBody externalUserId: String): DtoOutGataUser {
        val user = gataUserService.getUser(id)
        user.externalUserProviders.onEach {
            it.primary = it.id == externalUserId
        }
        return DtoOutGataUser(gataUserRepository.save(user))
    }
}
