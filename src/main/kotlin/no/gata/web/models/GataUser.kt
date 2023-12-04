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
        @OneToMany(mappedBy = "createdBy")
        @JsonIgnore
        var reports: List<GataReport>,
        @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL])
        @JsonIgnore
        var responsibilities: List<ResponsibilityYear>,
        @ManyToMany(fetch = FetchType.EAGER)
        var roles: List<GataRole>,
        @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL])
        var contingents: List<GataContingent>,
        var subscribe: Boolean
) {
    constructor() : this(
            id = null,
            externalUserProviders = emptyList(),
            responsibilities = emptyList(),
            reports= emptyList(),
            roles = emptyList(),
            contingents = emptyList(),
            subscribe = false)
    constructor(role: GataRole) : this(
            id = null,
            externalUserProviders = emptyList(),
            responsibilities = emptyList(),
            reports= emptyList(),
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
