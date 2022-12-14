package no.gata.web

import com.fasterxml.jackson.databind.ObjectMapper
import no.gata.web.models.ExternalUser
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.repository.GataUserRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc


@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        locations = arrayOf("classpath:integration-test.properties"))
class WebApplicationTests {

    @Autowired
    private val mockMvc: MockMvc? = null

    @Autowired
    private val objectMapper: ObjectMapper? = null

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var externalUserRepository: ExternalUserRepository

    @Test
    fun addExternalUser() {
        externalUserRepository.save(ExternalUser(id = "facebook|123", name = "Ola Nordmann", email = "ola.nordmanm@gmail.com"))
        val externalUser = externalUserRepository.findById("facebook|123")
        assertThat(externalUser.get().name).isEqualTo("Ola Nordmann")
    }

    @Test
    fun check() {
        val externalUser = externalUserRepository.findById("facebook|123")
        assertThat(externalUser.get().name).isEqualTo("Ola Nordmann")
    }

}
