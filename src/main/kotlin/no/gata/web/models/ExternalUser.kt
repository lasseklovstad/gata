package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne

@Entity
class ExternalUser (
    @Id
    var id: String = "",
    var name: String? = null,
    var email: String = "",
    @Column(length = 500)
    var picture: String? = null,
    var lastLogin: String? = null,
    @Column(name="primary_user")
    var primary: Boolean = false,
    @ManyToOne
    @JsonIgnore
    var user: GataUser? = null
)
