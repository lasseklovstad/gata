package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.*
import javax.persistence.*

@Entity
data class GataRole(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @JsonIgnore
        var externalUserProviderId: String,
        var name: String,
        @ManyToMany(mappedBy = "roles")
        @JsonIgnoreProperties("roles")
        var users: List<GataUser>?
)
