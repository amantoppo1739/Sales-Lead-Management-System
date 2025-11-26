<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Import;
use App\Models\Lead;
use App\Models\LeadScore;
use App\Models\LeadScoringRule;
use App\Models\LeadSource;
use App\Models\LeadStatusHistory;
use App\Models\Note;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use App\Services\LeadAssignmentService;
use App\Services\LeadScoringService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Seeding database with comprehensive data...');

        // Create Teams
        $this->command->info('Creating teams...');
        $teams = $this->createTeams();

        // Create Users
        $this->command->info('Creating users...');
        $users = $this->createUsers($teams);

        // Create Lead Sources
        $this->command->info('Creating lead sources...');
        $sources = $this->createLeadSources();

        // Create Products
        $this->command->info('Creating products...');
        $products = $this->createProducts();

        // Create Scoring Rules
        $this->command->info('Creating scoring rules...');
        $this->createScoringRules($teams);

        // Create Leads
        $this->command->info('Creating leads...');
        $leads = $this->createLeads($teams, $users, $sources, $products);

        // Create Imports
        $this->command->info('Creating imports...');
        $this->createImports($users);

        $this->command->info('✅ Database seeding completed!');
        $this->command->info("Created: {$teams->count()} teams, {$users->count()} users, {$sources->count()} sources, {$products->count()} products, {$leads->count()} leads");
    }

    protected function createTeams(): \Illuminate\Support\Collection
    {
        $teamData = [
            ['name' => 'North India Sales', 'territory_code' => 'NORTH', 'description' => 'Handles accounts across North India (Delhi, NCR, Punjab, Haryana).'],
            ['name' => 'South India Sales', 'territory_code' => 'SOUTH', 'description' => 'Focuses on South India (Bangalore, Chennai, Hyderabad, Kerala).'],
            ['name' => 'West India Sales', 'territory_code' => 'WEST', 'description' => 'Mumbai, Pune, Gujarat region coverage.'],
            ['name' => 'East India Sales', 'territory_code' => 'EAST', 'description' => 'Kolkata, Odisha, West Bengal market development.'],
            ['name' => 'Enterprise Sales', 'territory_code' => 'PAN-INDIA', 'description' => 'Pan-India enterprise accounts.'],
            ['name' => 'SMB Division', 'territory_code' => 'CENTRAL', 'description' => 'Central India and SMB focus (MP, Chhattisgarh).'],
        ];

        $teams = collect();
        foreach ($teamData as $data) {
            $teams->push(Team::create($data));
        }

        return $teams;
    }

    protected function createUsers($teams): \Illuminate\Support\Collection
    {
        $users = collect();

        // Create admin
        $users->push($admin = User::create([
            'first_name' => 'Arjun',
            'last_name' => 'Sharma',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'team_id' => $teams[0]->id,
            'phone' => '+91-9876543210',
        ]));

        // Create managers (one per team) with Indian names
        $indianFirstNames = ['Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Amit', 'Kavya', 'Rohan', 'Divya', 'Karan', 'Isha', 'Aditya', 'Meera', 'Siddharth', 'Pooja', 'Raj', 'Neha', 'Vivek', 'Shreya'];
        $indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Gupta', 'Joshi', 'Verma', 'Agarwal', 'Malhotra', 'Mehta', 'Iyer', 'Nair', 'Rao', 'Desai', 'Shah', 'Kapoor', 'Chopra', 'Bansal', 'Arora'];
        
        $managers = collect();
        foreach ($teams as $index => $team) {
            $manager = User::create([
                'first_name' => fake()->randomElement($indianFirstNames),
                'last_name' => fake()->randomElement($indianLastNames),
                'email' => "manager.team{$team->id}@example.com",
                'password' => Hash::make('password'),
                'role' => 'manager',
                'team_id' => $team->id,
                'phone' => fake()->numerify('+91-##########'),
            ]);
            $team->update(['manager_id' => $manager->id]);
            $users->push($manager);
            $managers->push($manager);
        }

        // Create sales reps (3-5 per team) with Indian names
        $indianFirstNames = ['Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Amit', 'Kavya', 'Rohan', 'Divya', 'Karan', 'Isha', 'Aditya', 'Meera', 'Siddharth', 'Pooja', 'Raj', 'Neha', 'Vivek', 'Shreya', 'Aryan', 'Anjali', 'Kunal', 'Riya', 'Manish', 'Tanvi', 'Harsh', 'Sakshi', 'Yash', 'Nisha'];
        $indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Gupta', 'Joshi', 'Verma', 'Agarwal', 'Malhotra', 'Mehta', 'Iyer', 'Nair', 'Rao', 'Desai', 'Shah', 'Kapoor', 'Chopra', 'Bansal', 'Arora', 'Jain', 'Saxena', 'Tiwari', 'Mishra', 'Pandey'];
        
        $salesReps = collect();
        $repCounter = 0;
        foreach ($teams as $teamIndex => $team) {
            $repCount = fake()->numberBetween(3, 5);
            for ($i = 0; $i < $repCount; $i++) {
                $rep = User::create([
                    'first_name' => fake()->randomElement($indianFirstNames),
                    'last_name' => fake()->randomElement($indianLastNames),
                    'email' => "rep.{$team->id}.{$repCounter}@example.com",
                    'password' => Hash::make('password'),
                    'role' => 'sales_rep',
                    'team_id' => $team->id,
                    'phone' => fake()->numerify('+91-##########'),
                ]);
                $users->push($rep);
                $salesReps->push($rep);
                $repCounter++;
            }
        }

        // Keep original demo users for reference (with Indian names)
        $users->push(User::create([
            'first_name' => 'Priya',
            'last_name' => 'Patel',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'team_id' => $teams[0]->id,
            'phone' => '+91-9876543211',
        ]));

        $users->push(User::create([
            'first_name' => 'Rahul',
            'last_name' => 'Kumar',
            'email' => 'rep.north@example.com',
            'password' => Hash::make('password'),
            'role' => 'sales_rep',
            'team_id' => $teams[0]->id,
            'phone' => '+91-9876543212',
        ]));

        $users->push(User::create([
            'first_name' => 'Ananya',
            'last_name' => 'Reddy',
            'email' => 'rep.south@example.com',
            'password' => Hash::make('password'),
            'role' => 'sales_rep',
            'team_id' => $teams[1]->id,
            'phone' => '+91-9876543213',
        ]));

        return $users;
    }

    protected function createLeadSources(): \Illuminate\Support\Collection
    {
        $sourceData = [
            ['name' => 'Website Form', 'slug' => 'website', 'channel' => 'web'],
            ['name' => 'Trade Show', 'slug' => 'trade-show', 'channel' => 'event'],
            ['name' => 'Partner Referral', 'slug' => 'partner', 'channel' => 'referral'],
            ['name' => 'LinkedIn Campaign', 'slug' => 'linkedin', 'channel' => 'web'],
            ['name' => 'Email Marketing', 'slug' => 'email', 'channel' => 'web'],
            ['name' => 'Conference', 'slug' => 'conference', 'channel' => 'event'],
            ['name' => 'Customer Referral', 'slug' => 'customer-ref', 'channel' => 'referral'],
            ['name' => 'Cold Outreach', 'slug' => 'cold-outreach', 'channel' => 'default'],
            ['name' => 'Webinar', 'slug' => 'webinar', 'channel' => 'web'],
            ['name' => 'Social Media', 'slug' => 'social', 'channel' => 'web'],
        ];

        $sources = collect();
        foreach ($sourceData as $data) {
            $sources->push(LeadSource::create($data));
        }

        return $sources;
    }

    protected function createProducts(): \Illuminate\Support\Collection
    {
        // Prices in INR (converted approximately: 1 USD ≈ 83 INR)
        $productData = [
            ['name' => 'CRM Core', 'sku' => 'CRM-CORE', 'type' => 'software', 'price' => 249000, 'currency' => 'INR'],
            ['name' => 'Analytics Add-on', 'sku' => 'CRM-ANALYTICS', 'type' => 'service', 'price' => 124500, 'currency' => 'INR'],
            ['name' => 'Enterprise Suite', 'sku' => 'CRM-ENT', 'type' => 'software', 'price' => 829000, 'currency' => 'INR'],
            ['name' => 'Mobile App', 'sku' => 'CRM-MOBILE', 'type' => 'software', 'price' => 41400, 'currency' => 'INR'],
            ['name' => 'Integration Hub', 'sku' => 'CRM-INTEGRATE', 'type' => 'service', 'price' => 207500, 'currency' => 'INR'],
            ['name' => 'Training Package', 'sku' => 'CRM-TRAIN', 'type' => 'service', 'price' => 290500, 'currency' => 'INR'],
            ['name' => 'Support Premium', 'sku' => 'CRM-SUPPORT', 'type' => 'service', 'price' => 99600, 'currency' => 'INR'],
            ['name' => 'Custom Development', 'sku' => 'CRM-CUSTOM', 'type' => 'service', 'price' => 1245000, 'currency' => 'INR'],
        ];

        $products = collect();
        foreach ($productData as $data) {
            $products->push(Product::create($data));
        }

        return $products;
    }

    protected function createScoringRules($teams): void
    {
        $defaultWeights = [
            'source' => [
                'web' => 30,
                'referral' => 25,
                'event' => 20,
                'partner' => 15,
                'default' => 10,
            ],
            'engagement' => [
                'last_contacted' => 15,
                'next_action' => 10,
            ],
            'value' => [
                ['min' => 4150000, 'score' => 30], // ~50k USD in INR
                ['min' => 1660000, 'score' => 20], // ~20k USD in INR
                ['min' => 415000, 'score' => 15], // ~5k USD in INR
                ['min' => 0, 'score' => 5],
            ],
            'status' => [
                'converted' => 20,
                'qualified' => 15,
                'contacted' => 10,
                'new' => 5,
                'default' => 0,
            ],
        ];

        LeadScoringRule::create([
            'name' => 'Global Default',
            'weights' => $defaultWeights,
        ]);

        LeadScoringRule::create([
            'team_id' => $teams[0]->id,
            'name' => 'North India Enterprise Focus',
            'weights' => array_replace_recursive($defaultWeights, [
                'value' => [
                    ['min' => 6225000, 'score' => 35], // ~75k USD in INR
                    ['min' => 4150000, 'score' => 30], // ~50k USD in INR
                    ['min' => 1660000, 'score' => 18], // ~20k USD in INR
                    ['min' => 0, 'score' => 5],
                ],
            ]),
        ]);
    }

    protected function createLeads($teams, $users, $sources, $products): \Illuminate\Support\Collection
    {
        $leads = collect();
        $scoringService = app(LeadScoringService::class);
        $assignmentService = app(LeadAssignmentService::class);
        $salesReps = $users->where('role', 'sales_rep');
        $managers = $users->where('role', 'manager');
        $statuses = ['new', 'qualified', 'contacted', 'converted', 'lost'];
        $statusWeights = ['new' => 30, 'qualified' => 25, 'contacted' => 20, 'converted' => 15, 'lost' => 10];
        $currencies = ['INR']; // Indian Rupees only

        // Create 250 leads
        for ($i = 0; $i < 250; $i++) {
            $team = $teams->random();
            $teamReps = $salesReps->where('team_id', $team->id);
            $assignedRep = $teamReps->isNotEmpty() ? $teamReps->random() : $salesReps->random();
            $creator = fake()->randomElement([$assignedRep, $managers->where('team_id', $team->id)->first(), $users->where('role', 'admin')->first()]);
            $source = $sources->random();
            $status = $this->weightedRandom($statusWeights);
            $createdAt = fake()->dateTimeBetween('-6 months', 'now');
            // Potential values in INR (approximately 83,000 to 12,450,000 INR)
            $potentialValue = fake()->randomFloat(2, 83000, 12450000);

            // Set dates based on status
            $lastContactedAt = null;
            $nextActionAt = null;
            $expectedCloseDate = null;

            if (in_array($status, ['contacted', 'qualified', 'converted'])) {
                $lastContactedAt = fake()->dateTimeBetween($createdAt, 'now');
                if (in_array($status, ['qualified', 'converted'])) {
                    $nextActionAt = fake()->dateTimeBetween('now', '+30 days');
                    $expectedCloseDate = fake()->dateTimeBetween('now', '+90 days');
                }
            } elseif ($status === 'new') {
                $nextActionAt = fake()->dateTimeBetween('now', '+7 days');
            }

            // Generate Indian names
            $indianFirstNames = ['Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Amit', 'Kavya', 'Rohan', 'Divya', 'Karan', 'Isha', 'Aditya', 'Meera', 'Siddharth', 'Pooja', 'Raj', 'Neha', 'Vivek', 'Shreya', 'Aryan', 'Anjali', 'Kunal', 'Riya', 'Manish', 'Tanvi'];
            $indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Gupta', 'Joshi', 'Verma', 'Agarwal', 'Malhotra', 'Mehta', 'Iyer', 'Nair', 'Rao', 'Desai', 'Shah', 'Kapoor', 'Chopra', 'Bansal', 'Arora'];
            
            $lead = Lead::create([
                'first_name' => fake()->optional(0.8)->randomElement($indianFirstNames),
                'last_name' => fake()->optional(0.8)->randomElement($indianLastNames),
                'company_name' => fake()->company().' '.fake()->randomElement(['Pvt Ltd', 'Ltd', 'Technologies', 'Solutions', 'Services', 'Industries']),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->optional(0.9)->numerify('+91-##########'),
                'status' => $status,
                'stage' => $status,
                'team_id' => $team->id,
                'source_id' => $source->id,
                'assigned_to_user_id' => $assignedRep->id,
                'created_by_user_id' => $creator->id,
                'potential_value' => $potentialValue,
                'currency' => $currencies[array_rand($currencies)],
                'territory_code' => $team->territory_code,
                'last_contacted_at' => $lastContactedAt,
                'next_action_at' => $nextActionAt,
                'expected_close_date' => $expectedCloseDate ? $expectedCloseDate->format('Y-m-d') : null,
                'address' => [
                    'street' => fake()->streetAddress(),
                    'city' => fake()->randomElement(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad']),
                    'state' => fake()->randomElement(['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh']),
                    'postal_code' => fake()->numerify('######'),
                    'country' => 'India',
                ],
                'created_at' => $createdAt,
                'updated_at' => fake()->dateTimeBetween($createdAt, 'now'),
            ]);

            // Create status history
            LeadStatusHistory::create([
                'lead_id' => $lead->id,
                'from_status' => null,
                'to_status' => $status,
                'changed_by_user_id' => $creator->id,
                'comment' => 'Initial lead creation',
                'changed_at' => $createdAt,
            ]);

            // Add status transitions for non-new leads
            if ($status !== 'new') {
                $transitions = ['new'];
                if (in_array($status, ['qualified', 'contacted', 'converted', 'lost'])) {
                    $transitions[] = 'qualified';
                }
                if (in_array($status, ['contacted', 'converted', 'lost'])) {
                    $transitions[] = 'contacted';
                }
                if ($status === 'converted') {
                    $transitions[] = 'converted';
                }
                if ($status === 'lost') {
                    $transitions[] = 'lost';
                }

                for ($j = 1; $j < count($transitions); $j++) {
                    LeadStatusHistory::create([
                        'lead_id' => $lead->id,
                        'from_status' => $transitions[$j - 1],
                        'to_status' => $transitions[$j],
                        'changed_by_user_id' => fake()->randomElement([$assignedRep->id, $creator->id]),
                        'comment' => fake()->sentence(),
                        'changed_at' => fake()->dateTimeBetween($createdAt, 'now'),
                    ]);
                }
            }

            // Attach products (60% of leads have products)
            if (fake()->boolean(60)) {
                $leadProducts = $products->random(fake()->numberBetween(1, 3));
                foreach ($leadProducts as $product) {
                    $lead->products()->attach($product->id, [
                        'quantity' => fake()->numberBetween(1, 5),
                        'price' => $product->price,
                    ]);
                }
            }

            // Calculate and create lead score
            $lead->load('source');
            $scoreData = $scoringService->calculate($lead);
            LeadScore::create([
                'lead_id' => $lead->id,
                'score' => $scoreData['score'],
                'breakdown' => $scoreData['breakdown'],
                'calculated_by_user_id' => $creator->id,
                'calculated_at' => now(),
            ]);

            // Create activities (2-5 per lead)
            $activityCount = fake()->numberBetween(2, 5);
            $activityActions = [
                'lead.created',
                'lead.status_changed',
                'lead.updated',
                'note.created',
                'lead.contacted',
                'lead.qualified',
                'lead.meeting_scheduled',
                'lead.proposal_sent',
            ];

            for ($k = 0; $k < $activityCount; $k++) {
                Activity::create([
                    'action' => $activityActions[array_rand($activityActions)],
                    'actor_type' => User::class,
                    'actor_id' => fake()->randomElement([$assignedRep->id, $creator->id]),
                    'subject_type' => Lead::class,
                    'subject_id' => $lead->id,
                    'properties' => [
                        'summary' => fake()->sentence(),
                        'status' => $status,
                    ],
                    'occurred_at' => fake()->dateTimeBetween($createdAt, 'now'),
                ]);
            }

            // Create notes (70% of leads have notes, 1-4 per lead)
            if (fake()->boolean(70)) {
                $noteCount = fake()->numberBetween(1, 4);
                for ($n = 0; $n < $noteCount; $n++) {
                    Note::create([
                        'notable_type' => Lead::class,
                        'notable_id' => $lead->id,
                        'author_id' => fake()->randomElement([$assignedRep->id, $creator->id]),
                        'body' => fake()->paragraph(),
                        'metadata' => fake()->boolean(20) ? ['pinned' => true] : null,
                        'created_at' => fake()->dateTimeBetween($createdAt, 'now'),
                    ]);
                }
            }

            $leads->push($lead);

            if (($i + 1) % 50 === 0) {
                $this->command->info("  Created {$leads->count()} leads...");
            }
        }

        return $leads;
    }

    protected function createImports($users): void
    {
        $statuses = ['completed', 'processing', 'failed'];
        $statusWeights = ['completed' => 60, 'processing' => 20, 'failed' => 20];

        for ($i = 0; $i < 15; $i++) {
            $status = $this->weightedRandom($statusWeights);
            $totalRows = fake()->numberBetween(50, 5000);
            $processedRows = $status === 'completed' ? $totalRows : fake()->numberBetween(0, $totalRows);
            $errorRows = fake()->numberBetween(0, min(50, $totalRows - $processedRows));

            Import::create([
                'type' => 'leads',
                'status' => $status,
                'file_path' => 'imports/'.Str::uuid().'.csv',
                'total_rows' => $totalRows,
                'processed_rows' => $processedRows,
                'error_rows' => $errorRows,
                'created_by_user_id' => $users->whereIn('role', ['sales_rep', 'manager', 'admin'])->random()->id,
                'meta' => [
                    'filename' => fake()->word().'.csv',
                    'imported_at' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d H:i:s'),
                ],
                'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
            ]);
        }
    }

    protected function weightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = mt_rand(1, $total);
        $current = 0;

        foreach ($weights as $key => $weight) {
            $current += $weight;
            if ($random <= $current) {
                return $key;
            }
        }

        return array_key_first($weights);
    }
}
