package no.gata.web.exception

class GataUserNotFound(val id: String) : RuntimeException("Det finnes ingen bruker med id: $id")
