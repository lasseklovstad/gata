package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import jakarta.persistence.*
import org.hibernate.annotations.Cascade

@Entity
class GataUser (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @OneToMany(mappedBy = "user")
        var externalUserProviders: List<ExternalUser>,
        @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL])
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
    constructor(role: GataRole) : this(
            id = null,
            externalUserProviders = emptyList(),
            responsibilities = emptyList(),
            roles = listOf(role),
            contingents = emptyList(),
            subscribe = false)

    fun getIsUserMember(): Boolean {
        return roles.find { it.name == GataRoleName.Medlem.name } != null
    }

    fun getIsUserAdmin(): Boolean {
        return roles.find { it.name == GataRoleName.Administrator.name } != null
    }

    fun getPrimaryUser(): ExternalUser? {
        return this.externalUserProviders.find { it.primary }
    }
}
