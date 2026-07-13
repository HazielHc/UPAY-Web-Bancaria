# UPAY-Web-Bancaria
Desarrollo de aplicación web gestora de cuentas bancarias con servicio de autenticación  y conversor de divisas. 


## Estado actual del proyecto

Actualmente se encuentran implementados y configurados para ejecutarse los siguientes microservicios:

- Auth Service
- Account Service
- Transaction Service
- Currency Service

Los servicios `api-gateway` y `notification-service` forman parte de la arquitectura del proyecto y serán incorporados en futuras versiones.


# Instalación de dependencias

## Dependencia de la raíz del proyecto

Desde la carpeta raíz del proyecto:

```bash
pnpm add -D concurrently
```

---

## auth-service

```bash
cd auth-service

pnpm add bcrypt cors dotenv express google-auth-library jsonwebtoken mongoose uuid

pnpm add -D @types/bcrypt @types/cors @types/express @types/jsonwebtoken @types/node tsx typescript
```

---

## account-service

```bash
cd account-service

pnpm add cors dotenv express jsonwebtoken mysql2 zod

pnpm add -D @types/cors @types/express @types/jsonwebtoken @types/node tsx typescript
```

> **Nota:** No es necesario instalar `crypto`, ya que es un módulo nativo de Node.js.

---

## transaction-service

```bash
cd transaction-service

pnpm add cors dotenv express jsonwebtoken mysql2 zod

pnpm add -D @types/cors @types/express @types/jsonwebtoken @types/node tsx typescript
```

---

## currency-service

```bash
cd currency-service

pnpm add cors dotenv express jsonwebtoken zod

pnpm add -D @types/cors @types/express @types/jsonwebtoken @types/node tsx typescript
```

---

## Ejecutar el proyecto

Desde la carpeta raíz:

```bash
pnpm install
pnpm run dev
```