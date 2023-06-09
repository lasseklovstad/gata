package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne

@Entity
data class ExternalUser (
    @Id
    var id: String,
    var name: String?,
    var email: String,
    var picture: String?,
    var lastLogin: String?,
    @Column(name="primary_user")
    var primary: Boolean,
    @ManyToOne
    @JsonIgnore
    var user: GataUser?
)
