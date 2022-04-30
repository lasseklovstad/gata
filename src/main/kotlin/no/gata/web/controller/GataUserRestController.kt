package no.gata.web.controller

import no.gata.web.models.GataUser
import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import no.gata.web.repository.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Year
import java.util.*

data class ResponsibilityYearPayload(
        var responsibilityId: String,
        var year: Int
)

data class ResponsibilityNotePayload(
        var text: String,
)

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

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(authentication: Authentication): List<GataUser> {
        val isAdmin = authentication.authorities.find { it.authority.equals("admin") }
        if(isAdmin!= null){
            return gataUserRepository.findAll()
        }
        val role = gataRoleRepository.findByName("Medlem")
        return gataUserRepository.findAllByRolesEquals(role.get())
    }

    @GetMapping("loggedin")
    @PreAuthorize("hasAuthority('member')")
    fun getLoggedInUser(authentication: Authentication): GataUser {
        val user = gataUserRepository.findByExternalUserProviderId(authentication.name)
        if (user.isPresent) {
            return user.get()
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Brukeren finnes ikke!");
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getUser(@PathVariable id: String): GataUser? {
        return gataUserRepository
                .findById(UUID.fromString(id))
                .orElseThrow(({ ResponseStatusException(HttpStatus.NOT_FOUND, java.lang.String.format("User with id %d not found", id)) }))
    }

    @GetMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilitiesByUserId(@PathVariable id: String): List<ResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        return responsibilityYearRepository.findResponsibilityYearsByUser(user)
    }

    @DeleteMapping("{id}/responsibilityyear/{responsibilityYearId}")
    @PreAuthorize("hasAuthority('admin')")
    fun removeResponseibilityForUser(@PathVariable responsibilityYearId: String, @PathVariable id: String): List<ResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        if (user.getIsUserMember()) {
            val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
            val note = responsibilityYear.note
            if (note != null) {
                responsibilityNoteRepository.delete(note)
            }
            responsibilityYearRepository.delete(responsibilityYear)

            return responsibilityYearRepository.findResponsibilityYearsByUser(user)
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PostMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('admin')")
    fun createResponsibilityForUser(@PathVariable id: String, @RequestBody responsibilityYearPayload: ResponsibilityYearPayload): List<ResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        val year = Year.of(responsibilityYearPayload.year);
        if (user.getIsUserMember()) {
            val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityYearPayload.responsibilityId)).get()
            val responsibilityYearCheck = responsibilityYearRepository.findResponsibilityYearsByUserAndYearAndResponsibility(user, year, responsibility)
            if (responsibilityYearCheck.isNotEmpty()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker har allerede denne ansvarsposten for dette året.");
            }


            val responsibilityYear = ResponsibilityYear(id = null, year = year, user = user, responsibility = responsibility, note = null)
            val note = ResponsibilityNote(id = null, lastModifiedDate = Date(), lastModifiedBy = user.name, text = "", responsibilityYear = responsibilityYear)
            responsibilityYear.note = note
            responsibilityYearRepository.save(responsibilityYear);

            return responsibilityYearRepository.findResponsibilityYearsByUser(user)
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PutMapping("{id}/responsibilityyear/{responsibilityYearId}/note")
    @PreAuthorize("hasAuthority('member')")
    fun updateResponsibilityNote(@PathVariable responsibilityYearId: String,
                                 @PathVariable id: String, authentication: Authentication,
                                 @RequestBody noteBody: ResponsibilityNotePayload): ResponsibilityYear {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        val loggedInUser = getLoggedInUser(authentication)
        val isAdmin = authentication.authorities.find { it.authority=="admin" } != null
        if (loggedInUser.id != user.id && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du kan ikke endre på noen andre sine ansvarsposter!");
        }


        if (user.getIsUserMember()) {
            val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
            responsibilityYear.note?.update(user,noteBody.text)
            return responsibilityYearRepository.save(responsibilityYear);
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }
}
