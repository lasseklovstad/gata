package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonProperty

class Auth0User(
    var name: String,
    var email: String,
    var picture: String?,
    @JsonProperty("sub")
    var userId: String,
)
