package no.gata.web.service

import no.gata.web.exception.GataUserNotFound
import no.gata.web.models.GataUser
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

@Service
class GataUserService {
    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    fun getUser(id: String): GataUser{
        return gataUserRepository.findById(UUID.fromString(id)).orElseThrow { GataUserNotFound(id) }
    }
}
