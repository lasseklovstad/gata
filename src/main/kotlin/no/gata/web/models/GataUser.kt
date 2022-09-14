package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import javax.persistence.*

@Entity
data class GataUser(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @OneToMany(mappedBy = "user")
        var externalUserProviders: List<ExternalUser>,
        @OneToMany(mappedBy = "user")
        @JsonIgnore
        var responsibilities: List<ResponsibilityYear>,
        @ManyToMany()
        var roles: List<GataRole>,
        @OneToMany(mappedBy = "user")
        var contingents: List<GataContingent>,
        var subscribe: Boolean
) {
    constructor() : this(
            id = null,
            externalUserProviders = emptyList(),
            responsibilities = emptyList(),
            roles = emptyList(),
            contingents = emptyList(),
            subscribe = false)

    fun getIsUserMember(): Boolean {
        return roles.find { it.name == "Medlem" } != null
    }

    fun getIsUserAdmin(): Boolean {
        return roles.find { it.name == "Administrator" } != null
    }

    fun getPrimaryUser(): ExternalUser? {
        return this.externalUserProviders.find { it.primary }
    }
}
