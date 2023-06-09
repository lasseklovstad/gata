package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
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
        @JsonIgnore
        var users: List<GataUser>?
)
