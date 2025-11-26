# Demo Users

The project seeds four ready-to-use accounts whenever you run `php artisan migrate:fresh --seed` (or the first time the containers spin up). Use them for local testing and demos.

| Role      | Name             | Email                 | Password | Highlights |
|-----------|------------------|-----------------------|----------|------------|
| Admin     | Alex Admin       | `admin@example.com`   | `password` | Full platform access. Can view/edit/delete any lead, manage imports, and administer teams. |
| Manager   | Morgan Manager   | `manager@example.com` | `password` | Manages the North America team. Can reassign/delete team leads, approve imports, and create new records. |
| Sales Rep | Riley Rep (NA)   | `rep.na@example.com`  | `password` | Assigned to the North America territory. Can manage their own leads, log notes, run imports for their accounts. |
| Sales Rep | Elliot Rep (EMEA)| `rep.emea@example.com`| `password` | Assigned to the EMEA team. Same permissions as other sales reps but scoped to EMEA assignments. |

### Usage notes

- Frontend login lives at `http://localhost:3000/`; backend API at `http://localhost:8000/api/v1`.
- All demo accounts use Sanctum tokens; the React app stores the token and user profile in the local auth store.
- Feel free to change passwords via the database or seeder if you need unique credentials for a demo. Re-run `php artisan migrate:fresh --seed` to reset to the defaults above.

