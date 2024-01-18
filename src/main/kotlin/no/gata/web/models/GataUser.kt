package no.gata.web.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.OneToMany
import java.util.UUID

@Entity
class GataUser(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID?,
    @OneToMany(mappedBy = "user")
    var externalUserProviders: List<ExternalUser>,
    @OneToMany(mappedBy = "createdBy")
    var reports: List<GataReport>,
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL])
    var responsibilities: List<ResponsibilityYear>,
    @ManyToMany(fetch = FetchType.EAGER)
    var roles: List<GataRole>,
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL])
    var contingents: List<GataContingent>,
    var subscribe: Boolean,
) {
    constructor() : this(
        id = null,
        externalUserProviders = emptyList(),
        responsibilities = emptyList(),
        reports = emptyList(),
        roles = emptyList(),
        contingents = emptyList(),
        subscribe = false,
    )

    constructor(role: GataRole) : this(
        id = null,
        externalUserProviders = emptyList(),
        responsibilities = emptyList(),
        reports = emptyList(),
        roles = listOf(role),
        contingents = emptyList(),
        subscribe = false,
    )

    fun getIsUserMember(): Boolean {
        return roles.find { it.roleName == UserRoleName.Member } != null
    }

    fun getIsUserAdmin(): Boolean {
        return roles.find { it.roleName == UserRoleName.Admin } != null
    }

    fun getPrimaryUser(): ExternalUser? {
        return this.externalUserProviders.find { it.primary }
    }
}
