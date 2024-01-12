package no.gata.web

import no.gata.web.service.RoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WebApplication : CommandLineRunner {
    @Autowired
    private lateinit var roleService: RoleService

    override fun run(vararg args: String?) {
        roleService.seedRoles()
    }
}

fun main(args: Array<String>) {
    runApplication<WebApplication>(*args)
}
