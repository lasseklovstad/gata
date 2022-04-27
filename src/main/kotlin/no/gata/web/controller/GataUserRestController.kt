package no.gata.web.controller

import no.gata.web.models.GataUser
import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import no.gata.web.repository.GataUserRepository
import no.gata.web.repository.ResponsibilityNoteRepository
import no.gata.web.repository.ResponsibilityRepository
import no.gata.web.repository.ResponsibilityYearRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Year
import java.util.*

data class ResponsibilityYearPayload(
        var responsibilityId: String,
        var year: Int
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

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(): List<GataUser> {
        val users =  gataUserRepository.findAll()
        return users
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
        if(user.getIsUserMember()){
            val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
            val note = responsibilityYear.note
            if(note != null){
                responsibilityNoteRepository.delete(note)
            }
            responsibilityYearRepository.delete(responsibilityYear)

            return responsibilityYearRepository.findResponsibilityYearsByUser(user)
        }else{
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PostMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('admin')")
    fun createResponsibilityForUser(@PathVariable id: String, @RequestBody responsibilityYearPayload: ResponsibilityYearPayload): List<ResponsibilityYear> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        val year = Year.of(responsibilityYearPayload.year);
        if(user.getIsUserMember()){
            val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityYearPayload.responsibilityId)).get()
            val responsibilityYearCheck = responsibilityYearRepository.findResponsibilityYearsByUserAndYearAndResponsibility(user,year,responsibility)
            if(responsibilityYearCheck.isNotEmpty()){
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker har allerede denne ansvarsposten for dette året.");
            }


            val responsibilityYear = ResponsibilityYear(id=null, year = year,user = user, responsibility = responsibility, note = null)
            val note = ResponsibilityNote(id = null, lastModifiedDate = Date(), lastModifiedBy = user.name, text="", responsibilityYear = responsibilityYear)
            responsibilityYear.note = note
            responsibilityYearRepository.save(responsibilityYear);

            return responsibilityYearRepository.findResponsibilityYearsByUser(user)
        }else{
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }
}
