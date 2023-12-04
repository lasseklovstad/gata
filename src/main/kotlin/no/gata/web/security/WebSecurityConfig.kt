package no.gata.web.security

import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtDecoders
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain

@EnableWebSecurity
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
class WebSecurityConfig() {

    @Value(value = "\${auth0.audience}")
    private lateinit var audience: String

    @Value(value = "\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private lateinit var issuer: String

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests { authorize ->
            authorize.requestMatchers(
                "/api/user/**",
                "/api/file/**",
                "/api/role/**",
                "/api/auth0user/**",
                "/api/report/**",
                "/api/responsibility/**",
                "/api/contingent/**"
            ).authenticated().anyRequest().permitAll()
        }.oauth2ResourceServer { oauth2 ->
            oauth2.jwt { jwt ->
                jwt.decoder(jwtDecoder()).jwtAuthenticationConverter(CustomAuthenticationConverter(gataUserRepository))
            }
        }
        return http.build()
    }

    fun jwtDecoder(): JwtDecoder {
        val jwtDecoder = JwtDecoders.fromOidcIssuerLocation<JwtDecoder>(issuer) as NimbusJwtDecoder
        val audienceValidator = AudienceValidator(audience)
        val withIssuer = JwtValidators.createDefaultWithIssuer(issuer)
        val withAudience = DelegatingOAuth2TokenValidator(withIssuer, audienceValidator)
        jwtDecoder.setJwtValidator(withAudience)
        return jwtDecoder
    }

    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val converter = JwtGrantedAuthoritiesConverter()
        converter.setAuthoritiesClaimName("permissions")
        converter.setAuthorityPrefix("")
        val jwtConverter = JwtAuthenticationConverter()
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter)
        return jwtConverter
    }
}
