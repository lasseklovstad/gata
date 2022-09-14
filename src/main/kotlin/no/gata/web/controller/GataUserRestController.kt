package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnContingent
import no.gata.web.controller.dtoInn.DtoInnGataUser
import no.gata.web.controller.dtoInn.DtoInnResponsibilityNote
import no.gata.web.controller.dtoInn.DtoInnResponsibilityYear
import no.gata.web.controller.dtoOut.DtoOutGataContingent
import no.gata.web.controller.dtoOut.DtoOutGataUser
import no.gata.web.controller.dtoOut.DtoOutResponsibilityYear
import no.gata.web.models.GataContingent
import no.gata.web.models.GataUser
import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import no.gata.web.repository.*
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
                .orElseThrow(({ ResponseStatusException(HttpStatus.NOT_FOUND, "External user with id ${body.externalUserId} not found") }))
        val newGataUser = gataUserRepository.save(GataUser())
        externalUser.user = newGataUser
        externalUserRepository.save(externalUser)
        newGataUser.externalUserProviders = listOf(externalUser)
        return DtoOutGataUser(newGataUser)
    }

    @GetMapping("loggedin")
    @PreAuthorize("hasAuthority('member')")
    fun getLoggedInUser(authentication: Authentication): DtoOutGataUser {
        val user = gataUserRepository.findByExternalUserProvidersId(authentication.name)
        if (user.isPresent) {
            return DtoOutGataUser(user.get())
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Brukeren finnes ikke!");
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getUser(@PathVariable id: String): DtoOutGataUser? {
        return gataUserRepository
                .findById(UUID.fromString(id))
                .orElseThrow(({ ResponseStatusException(HttpStatus.NOT_FOUND, "User with id $id not found") }))
                .let { DtoOutGataUser(it) }
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: String) {
        val gatUser = gataUserRepository
                .findById(UUID.fromString(id))
                .orElseThrow(({ ResponseStatusException(HttpStatus.NOT_FOUND, "User with id $id not found") }))
        // Remove all roles
        val roles = gataRoleRepository.findAll()
        roleService.deleteRoles(gatUser, roles.toSet())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Kunne ikke oppdatere alle roller for bruker")
        // Remove link to external user
        gatUser.externalUserProviders = gatUser.externalUserProviders.map {
            it.user = null
            it
        }
        gataUserRepository.save(gatUser)
        // Delete user
        gataUserRepository.delete(gatUser)
    }

    @GetMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilitiesByUserId(@PathVariable id: String): List<DtoOutResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
    }

    @DeleteMapping("{id}/responsibilityyear/{responsibilityYearId}")
    @PreAuthorize("hasAuthority('admin')")
    fun removeResponseibilityForUser(@PathVariable responsibilityYearId: String, @PathVariable id: String): List<DtoOutResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        if (user.getIsUserMember()) {
            val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
            val note = responsibilityYear.note
            if (note != null) {
                responsibilityNoteRepository.delete(note)
            }
            responsibilityYearRepository.delete(responsibilityYear)

            return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PostMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('admin')")
    fun createResponsibilityForUser(@PathVariable id: String, @RequestBody responsibilityYearPayload: DtoInnResponsibilityYear): List<DtoOutResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        val year = responsibilityYearPayload.year;
        if (user.getIsUserMember()) {
            val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityYearPayload.responsibilityId)).get()
            val responsibilityYearCheck = responsibilityYearRepository.findResponsibilityYearsByUserAndYearAndResponsibility(user, year, responsibility)
            if (responsibilityYearCheck.isNotEmpty()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker har allerede denne ansvarsposten for dette året.");
            }


            val responsibilityYear = ResponsibilityYear(id = null, year = year, user = user, responsibility = responsibility, note = null)
            val note = ResponsibilityNote(id = null, lastModifiedDate = Date(), lastModifiedBy = user.getPrimaryUser()!!.name, text = "", responsibilityYear = responsibilityYear)
            responsibilityYear.note = note
            responsibilityYearRepository.save(responsibilityYear);

            return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PutMapping("{id}/responsibilityyear/{responsibilityYearId}/note")
    @PreAuthorize("hasAuthority('member')")
    fun updateResponsibilityNote(@PathVariable responsibilityYearId: String,
                                 @PathVariable id: String, authentication: Authentication,
                                 @RequestBody noteBody: DtoInnResponsibilityNote): DtoOutResponsibilityYear {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        val loggedInUser = getLoggedInUser(authentication)
        val isAdmin = authentication.authorities.find { it.authority == "admin" } != null
        if (loggedInUser.id != user.id.toString() && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du kan ikke endre på noen andre sine ansvarsposter!");
        }


        if (user.getIsUserMember()) {
            val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
            responsibilityYear.note?.update(user, noteBody.text)
            return DtoOutResponsibilityYear(responsibilityYearRepository.save(responsibilityYear))
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PostMapping("{id}/contingent")
    @PreAuthorize("hasAuthority('admin')")
    fun postContingent(@PathVariable id: String, @RequestBody body: DtoInnContingent): List<DtoOutGataContingent> {
        val userOptional = gataUserRepository.findById(UUID.fromString(id))
        if (userOptional.isPresent) {
            val user = userOptional.get()
            if (user.getIsUserMember()) {
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
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Brukeren er ikke medlem");
        } else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Brukeren finnes ikke");
        }
    }

    @PutMapping("{id}/subscribe")
    @PreAuthorize("hasAuthority('member')")
    fun updateSubscribe(@PathVariable id: String): DtoOutGataUser {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        user.subscribe = !user.subscribe
        return DtoOutGataUser(gataUserRepository.save(user))
    }
}
