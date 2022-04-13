package no.gata.web.controller

import no.gata.web.models.Responsibility
import no.gata.web.repoistory.ResponsibilityRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

data class ResponsibilityBody(
    var name: String,
    var description: String,
)

@RestController
@RequestMapping("api/responsibility")
class ResponsibilityRestController {
    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilities(): List<Responsibility> {
        return responsibilityRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postResponsibility(@RequestBody body: Responsibility): Responsibility {
        return responsibilityRepository.save(
            body
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
}
