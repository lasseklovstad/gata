package no.gata.web

import no.gata.web.service.Auth0RestService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class WebApplication : CommandLineRunner {
    @Autowired
    private lateinit var auth0RestService: Auth0RestService

    @Value(value = "\${gata.update.users.on.startup}")
    private var runUpdateUserOnStartup: Boolean = false

    override fun run(vararg args: String?) {
        if(this.runUpdateUserOnStartup){
            auth0RestService.updateInternalUsersWithExternalData()
        }
    }
}

fun main(args: Array<String>) {
    runApplication<WebApplication>(*args)
}


