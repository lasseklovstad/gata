package no.gata.web.controller

import no.gata.web.models.GataUser
import no.gata.web.models.Responsibility
import no.gata.web.repository.GataUserRepository
import no.gata.web.repository.ResponsibilityRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

data class ResponsibilityBody(
        var name: String,
        var description: String,
)

@RestController
@RequestMapping("api/responsibility")
class ResponsibilityRestController {
    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilities(): List<Responsibility> {
        return responsibilityRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postResponsibility(@RequestBody body: ResponsibilityBody): Responsibility {
        return responsibilityRepository.save(
                Responsibility(id = null, name = body.name, description = body.description, user = null)
        );
    }

    @PutMapping
    @PreAuthorize("hasAuthority('admin')")
    fun putResponsibility(@RequestBody body: Responsibility): Responsibility {
        return responsibilityRepository.save(
                body
        );
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteResponsibility(@RequestBody body: Responsibility) {
        return responsibilityRepository.delete(
                body
        );
    }

    @DeleteMapping("{respnsibilityId}/user/{id}")
    @PreAuthorize("hasAuthority('admin')")
    fun removeResponseibilityForUser(@PathVariable respnsibilityId: String,@PathVariable id: String): List<Responsibility> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        if(user.getIsUserMember()){
            val responsibility = responsibilityRepository.findById(UUID.fromString(respnsibilityId)).get()
            responsibility.user = null
            responsibilityRepository.save(responsibility)
            return responsibilityRepository.findResponsibilityByUser(user)
        }else{
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @PostMapping("{respnsibilityId}/user/{id}")
    @PreAuthorize("hasAuthority('admin')")
    fun addResponseibilityForUser(@PathVariable respnsibilityId: String,@PathVariable id: String): List<Responsibility> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        if(user.getIsUserMember()){
            val responsibility = responsibilityRepository.findById(UUID.fromString(respnsibilityId)).get()
            responsibility.user = user
            responsibilityRepository.save(responsibility)
            return responsibilityRepository.findResponsibilityByUser(user)

        }else{
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Bruker må være medlem for å kunne få ansvarspost.");
        }
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilitiesByUserId(@PathVariable id: String): List<Responsibility> {
        val user = gataUserRepository.findById(UUID.fromString(id)).get()
        return user.responsibilities.toList()
    }
}
