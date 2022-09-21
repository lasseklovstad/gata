package no.gata.web.exception

class GataUserNoSufficientRole(val role: String) : RuntimeException("Brukeren er ikke $role")
