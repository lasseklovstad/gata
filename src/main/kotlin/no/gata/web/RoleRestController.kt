package no.gata.web

import no.gata.web.models.Role
import no.gata.web.repository.RoleRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("api/role")
class RoleRestController {
    @Autowired
    lateinit var roleRepository: RoleRepository

    @GetMapping
    fun getRoles():List<Role>{
        return roleRepository.findAll()
    }

    @PostMapping
    fun postRole(@RequestBody role: Role):Role{
       return  roleRepository.save(role)
    }
}
