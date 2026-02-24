<?php
/**
 * DevHub IT - Backend API Router
 * Social Network di nicchia per professionisti IT
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database setup
$dbDir = __DIR__ . '/data';
$dbPath = $dbDir . '/devhub.db';

if (!is_dir($dbDir)) {
    mkdir($dbDir, 0777, true);
}

if (!file_exists($dbPath)) {
    require_once __DIR__ . '/init-db.php';
    initDatabase($dbPath);
}

try {
    $db = new SQLite3($dbPath);
    $db->busyTimeout(5000);
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA foreign_keys=ON');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Parse request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove trailing slash
$uri = rtrim($uri, '/');

// Simple router
$routes = [];

// ========== JOBS API ==========

// GET /api/jobs - List jobs with optional filters
$routes['GET']['/api/jobs'] = function() use ($db) {
    $where = [];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = "category = :category";
        $params[':category'] = $_GET['category'];
    }
    if (!empty($_GET['level'])) {
        $where[] = "level = :level";
        $params[':level'] = $_GET['level'];
    }
    if (!empty($_GET['type'])) {
        $where[] = "type = :type";
        $params[':type'] = $_GET['type'];
    }
    if (!empty($_GET['salary_min'])) {
        $where[] = "salary_max >= :salary_min";
        $params[':salary_min'] = (int)$_GET['salary_min'];
    }
    if (!empty($_GET['salary_max'])) {
        $where[] = "salary_min <= :salary_max";
        $params[':salary_max'] = (int)$_GET['salary_max'];
    }
    if (!empty($_GET['search'])) {
        $where[] = "(title LIKE :search OR company LIKE :search2 OR description LIKE :search3)";
        $searchTerm = '%' . $_GET['search'] . '%';
        $params[':search'] = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
    }

    $sql = "SELECT * FROM jobs";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY posted_date DESC";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $result = $stmt->execute();
    $jobs = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $row['requirements'] = json_decode($row['requirements']);
        $row['benefits'] = json_decode($row['benefits']);
        $jobs[] = $row;
    }

    return $jobs;
};

// GET /api/jobs/:id - Single job
$routes['GET']['/api/jobs/(\d+)'] = function($id) use ($db) {
    $stmt = $db->prepare("SELECT * FROM jobs WHERE id = :id");
    $stmt->bindValue(':id', (int)$id);
    $result = $stmt->execute();
    $job = $result->fetchArray(SQLITE3_ASSOC);

    if (!$job) {
        http_response_code(404);
        return ['error' => 'Job not found'];
    }

    $job['requirements'] = json_decode($job['requirements']);
    $job['benefits'] = json_decode($job['benefits']);
    return $job;
};

// ========== COURSES API ==========

// GET /api/courses - List courses
$routes['GET']['/api/courses'] = function() use ($db) {
    $where = [];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = "category = :category";
        $params[':category'] = $_GET['category'];
    }
    if (!empty($_GET['level'])) {
        $where[] = "level = :level";
        $params[':level'] = $_GET['level'];
    }

    $sql = "SELECT id, title, description, category, level, duration, badge_name, badge_color, prerequisites FROM courses";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY id ASC";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $result = $stmt->execute();
    $courses = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $courses[] = $row;
    }

    return $courses;
};

// GET /api/courses/:id - Single course with modules
$routes['GET']['/api/courses/(\d+)'] = function($id) use ($db) {
    $stmt = $db->prepare("SELECT * FROM courses WHERE id = :id");
    $stmt->bindValue(':id', (int)$id);
    $result = $stmt->execute();
    $course = $result->fetchArray(SQLITE3_ASSOC);

    if (!$course) {
        http_response_code(404);
        return ['error' => 'Course not found'];
    }

    $course['modules'] = json_decode($course['modules']);
    $course['company_tips'] = json_decode($course['company_tips']);
    return $course;
};

// ========== QUIZZES API ==========

// GET /api/quizzes/:courseId - Get quiz for a course
$routes['GET']['/api/quizzes/(\d+)'] = function($courseId) use ($db) {
    $stmt = $db->prepare("SELECT * FROM quizzes WHERE course_id = :course_id");
    $stmt->bindValue(':course_id', (int)$courseId);
    $result = $stmt->execute();
    $quiz = $result->fetchArray(SQLITE3_ASSOC);

    if (!$quiz) {
        http_response_code(404);
        return ['error' => 'Quiz not found'];
    }

    $quiz['questions'] = json_decode($quiz['questions']);
    // Don't send correct answers to client during quiz
    if (empty($_GET['include_answers'])) {
        foreach ($quiz['questions'] as &$q) {
            unset($q->correct);
            unset($q->explanation);
        }
    }
    return $quiz;
};

// POST /api/quizzes/:courseId/submit - Submit quiz answers
$routes['POST']['/api/quizzes/(\d+)/submit'] = function($courseId) use ($db) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['answers']) || !isset($input['user_id'])) {
        http_response_code(400);
        return ['error' => 'Missing answers or user_id'];
    }

    // Get quiz with answers
    $stmt = $db->prepare("SELECT * FROM quizzes WHERE course_id = :course_id");
    $stmt->bindValue(':course_id', (int)$courseId);
    $result = $stmt->execute();
    $quiz = $result->fetchArray(SQLITE3_ASSOC);

    if (!$quiz) {
        http_response_code(404);
        return ['error' => 'Quiz not found'];
    }

    $questions = json_decode($quiz['questions'], true);
    $answers = $input['answers'];
    $correct = 0;
    $total = count($questions);
    $details = [];

    foreach ($questions as $i => $q) {
        $userAnswer = isset($answers[$i]) ? $answers[$i] : -1;
        $isCorrect = $userAnswer === $q['correct'];
        if ($isCorrect) $correct++;
        $details[] = [
            'question' => $q['question'],
            'userAnswer' => $userAnswer,
            'correctAnswer' => $q['correct'],
            'isCorrect' => $isCorrect,
            'explanation' => $q['explanation']
        ];
    }

    $score = round(($correct / $total) * 100);
    $passed = $score >= $quiz['passing_score'];

    // Update user progress
    $userId = (int)$input['user_id'];

    $stmt = $db->prepare("SELECT * FROM user_progress WHERE user_id = :uid AND course_id = :cid");
    $stmt->bindValue(':uid', $userId);
    $stmt->bindValue(':cid', (int)$courseId);
    $existing = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

    if ($existing) {
        $stmt = $db->prepare("UPDATE user_progress SET quiz_score = :score, quiz_completed = 1 WHERE user_id = :uid AND course_id = :cid");
    } else {
        $stmt = $db->prepare("INSERT INTO user_progress (user_id, course_id, completed_modules, quiz_score, quiz_completed) VALUES (:uid, :cid, '[]', :score, 1)");
    }
    $stmt->bindValue(':score', $score);
    $stmt->bindValue(':uid', $userId);
    $stmt->bindValue(':cid', (int)$courseId);
    $stmt->execute();

    // Award badge if passed
    if ($passed) {
        $courseStmt = $db->prepare("SELECT badge_name FROM courses WHERE id = :id");
        $courseStmt->bindValue(':id', (int)$courseId);
        $courseResult = $courseStmt->execute()->fetchArray(SQLITE3_ASSOC);

        // Check if badge already awarded
        $badgeCheck = $db->prepare("SELECT id FROM user_badges WHERE user_id = :uid AND course_id = :cid");
        $badgeCheck->bindValue(':uid', $userId);
        $badgeCheck->bindValue(':cid', (int)$courseId);
        $existingBadge = $badgeCheck->execute()->fetchArray(SQLITE3_ASSOC);

        if (!$existingBadge && $courseResult) {
            $badgeStmt = $db->prepare("INSERT INTO user_badges (user_id, course_id, badge_name, earned_date, score) VALUES (:uid, :cid, :name, :date, :score)");
            $badgeStmt->bindValue(':uid', $userId);
            $badgeStmt->bindValue(':cid', (int)$courseId);
            $badgeStmt->bindValue(':name', $courseResult['badge_name']);
            $badgeStmt->bindValue(':date', date('Y-m-d'));
            $badgeStmt->bindValue(':score', $score);
            $badgeStmt->execute();
        }
    }

    return [
        'score' => $score,
        'correct' => $correct,
        'total' => $total,
        'passed' => $passed,
        'passing_score' => $quiz['passing_score'],
        'details' => $details
    ];
};

// ========== USER API ==========

// GET /api/user/:id - User profile
$routes['GET']['/api/user/(\d+)'] = function($id) use ($db) {
    $stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->bindValue(':id', (int)$id);
    $result = $stmt->execute();
    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        http_response_code(404);
        return ['error' => 'User not found'];
    }

    return $user;
};

// GET /api/user/:id/badges - User badges
$routes['GET']['/api/user/(\d+)/badges'] = function($id) use ($db) {
    $stmt = $db->prepare("
        SELECT ub.*, c.badge_color, c.category, c.level as course_level
        FROM user_badges ub
        JOIN courses c ON ub.course_id = c.id
        WHERE ub.user_id = :id
        ORDER BY ub.earned_date DESC
    ");
    $stmt->bindValue(':id', (int)$id);
    $result = $stmt->execute();
    $badges = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $badges[] = $row;
    }
    return $badges;
};

// GET /api/user/:id/progress - User progress across all courses
$routes['GET']['/api/user/(\d+)/progress'] = function($id) use ($db) {
    $stmt = $db->prepare("
        SELECT up.*, c.title as course_title, c.badge_name, c.badge_color, c.level as course_level
        FROM user_progress up
        JOIN courses c ON up.course_id = c.id
        WHERE up.user_id = :id
    ");
    $stmt->bindValue(':id', (int)$id);
    $result = $stmt->execute();
    $progress = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $row['completed_modules'] = json_decode($row['completed_modules']);
        $progress[] = $row;
    }
    return $progress;
};

// POST /api/user/:id/progress - Update module progress
$routes['POST']['/api/user/(\d+)/progress'] = function($id) use ($db) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['course_id']) || !isset($input['module_index'])) {
        http_response_code(400);
        return ['error' => 'Missing course_id or module_index'];
    }

    $courseId = (int)$input['course_id'];
    $moduleIndex = (int)$input['module_index'];
    $userId = (int)$id;

    $stmt = $db->prepare("SELECT * FROM user_progress WHERE user_id = :uid AND course_id = :cid");
    $stmt->bindValue(':uid', $userId);
    $stmt->bindValue(':cid', $courseId);
    $existing = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

    if ($existing) {
        $modules = json_decode($existing['completed_modules'], true) ?: [];
        if (!in_array($moduleIndex, $modules)) {
            $modules[] = $moduleIndex;
        }
        $stmt = $db->prepare("UPDATE user_progress SET completed_modules = :modules WHERE user_id = :uid AND course_id = :cid");
        $stmt->bindValue(':modules', json_encode($modules));
        $stmt->bindValue(':uid', $userId);
        $stmt->bindValue(':cid', $courseId);
        $stmt->execute();
    } else {
        $stmt = $db->prepare("INSERT INTO user_progress (user_id, course_id, completed_modules, quiz_score, quiz_completed) VALUES (:uid, :cid, :modules, 0, 0)");
        $stmt->bindValue(':uid', $userId);
        $stmt->bindValue(':cid', $courseId);
        $stmt->bindValue(':modules', json_encode([$moduleIndex]));
        $stmt->execute();
    }

    return ['success' => true];
};

// GET /api/stats - Platform stats
$routes['GET']['/api/stats'] = function() use ($db) {
    $jobCount = $db->querySingle("SELECT COUNT(*) FROM jobs");
    $courseCount = $db->querySingle("SELECT COUNT(*) FROM courses");
    $userCount = $db->querySingle("SELECT COUNT(*) FROM users");
    $badgeCount = $db->querySingle("SELECT COUNT(*) FROM user_badges");

    return [
        'jobs' => $jobCount,
        'courses' => $courseCount,
        'users' => $userCount,
        'badges_awarded' => $badgeCount
    ];
};

// ========== ROUTE MATCHING ==========

$matched = false;

foreach ($routes as $routeMethod => $routePaths) {
    if ($method !== $routeMethod) continue;

    foreach ($routePaths as $pattern => $handler) {
        // Convert route pattern to regex
        $regex = '#^' . $pattern . '$#';
        if (preg_match($regex, $uri, $matches)) {
            array_shift($matches); // Remove full match
            $result = call_user_func_array($handler, $matches);
            echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            $matched = true;
            break 2;
        }
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found', 'uri' => $uri, 'method' => $method]);
}

$db->close();
