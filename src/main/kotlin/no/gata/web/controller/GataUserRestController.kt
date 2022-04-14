package no.gata.web.controller

import no.gata.web.models.GataUser
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.*


@RestController
@RequestMapping("api/user")
class GataUserRestController {
    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

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
}
