package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonProperty

class Auth0User(
        var name: String,
        var email: String,
        var picture: String,
        @JsonProperty("user_id")
        var userId: String,
        var roles: List<Auth0Role>?,
        @JsonProperty("last_login")
        var lastLogin: String
)

class Auth0Role(
        var id: String,
        var name: String,
        var description: String,
)

class Auth0RolePayload(
        var roles: List<String>
)

class Auth0TokenPayload(
        var client_id: String,
        var client_secret: String,
        var audience: String,
        var grant_type: String,
)

class Auth0Token(
        var access_token: String,
        var scope: String,
        var expires_in: Int,
        var token_type: String,
)
