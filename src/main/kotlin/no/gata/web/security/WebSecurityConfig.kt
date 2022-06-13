package no.gata.web.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.jwt.*
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.util.matcher.RequestMatcher
import java.util.*
import javax.servlet.http.HttpServletRequest

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Value(value = "\${auth0.audience}")
    private lateinit var audience: String

    @Value(value = "\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private lateinit var issuer: String

    @Autowired
    private lateinit var env: Environment

    @Override
    override fun configure(http: HttpSecurity) {
        if (!env.activeProfiles.contains("dev")) {
            http.requiresChannel()
                    .requestMatchers(RequestMatcher { r: HttpServletRequest -> r.getHeader("X-Forwarded-Proto") != null })
                    .requiresSecure()
        }


        http.authorizeRequests()
                .mvcMatchers("/api/user", "/api/file", "/api/role", "api/auth0user", "api/report", "api/responsibility", "api/contingent")
                .authenticated().and().oauth2ResourceServer().jwt().decoder(jwtDecoder())
                .jwtAuthenticationConverter(jwtAuthenticationConverter());
    }

    fun jwtDecoder(): JwtDecoder? {
        val jwtDecoder = JwtDecoders.fromOidcIssuerLocation<JwtDecoder>(issuer) as NimbusJwtDecoder
        val audienceValidator: OAuth2TokenValidator<Jwt> = AudienceValidator(audience)
        val withIssuer: OAuth2TokenValidator<Jwt> = JwtValidators.createDefaultWithIssuer(issuer)
        val withAudience: OAuth2TokenValidator<Jwt> = DelegatingOAuth2TokenValidator(withIssuer, audienceValidator)
        jwtDecoder.setJwtValidator(withAudience)
        return jwtDecoder
    }

    fun jwtAuthenticationConverter(): JwtAuthenticationConverter? {
        val converter = JwtGrantedAuthoritiesConverter()
        converter.setAuthoritiesClaimName("permissions")
        converter.setAuthorityPrefix("")
        val jwtConverter = JwtAuthenticationConverter()
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter)
        return jwtConverter
    }
}
