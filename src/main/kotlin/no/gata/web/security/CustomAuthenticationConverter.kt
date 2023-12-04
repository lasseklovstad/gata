package no.gata.web.security

import no.gata.web.repository.GataUserRepository
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class CustomAuthenticationConverter(private var gataUserRepository: GataUserRepository) :
    Converter<Jwt, AbstractAuthenticationToken> {
    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val externalId = jwt.subject
        val userOptional = gataUserRepository.findByExternalUserProvidersId(externalId)

        val authorities = if (userOptional.isPresent) {
            userOptional.get().roles.flatMap { role ->
                if (role.name == "Medlem")
                    listOf(SimpleGrantedAuthority("member"))
                else listOf(
                    SimpleGrantedAuthority("admin"),
                    SimpleGrantedAuthority("member")
                )
            }
        } else {
            emptyList()
        }

        return JwtAuthenticationToken(jwt, authorities)
    }
}