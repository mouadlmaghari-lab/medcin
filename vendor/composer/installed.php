<?php return array(
    'root' => array(
        'name' => '__root__',
        'pretty_version' => '1.0.0+no-version-set',
        'version' => '1.0.0.0',
        'reference' => null,
        'type' => 'library',
        'install_path' => __DIR__ . '/../../',
        'aliases' => array(),
        'dev' => true,
    ),
    'versions' => array(
        '__root__' => array(
            'pretty_version' => '1.0.0+no-version-set',
            'version' => '1.0.0.0',
            'reference' => null,
            'type' => 'library',
            'install_path' => __DIR__ . '/../../',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'php-http/async-client-implementation' => array(
            'dev_requirement' => false,
            'provided' => array(
                0 => '*',
            ),
        ),
        'php-http/client-implementation' => array(
            'dev_requirement' => false,
            'provided' => array(
                0 => '*',
            ),
        ),
        'php-http/discovery' => array(
            'pretty_version' => '1.20.0',
            'version' => '1.20.0.0',
            'reference' => '82fe4c73ef3363caed49ff8dd1539ba06044910d',
            'type' => 'composer-plugin',
            'install_path' => __DIR__ . '/../php-http/discovery',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'psr/http-client-implementation' => array(
            'dev_requirement' => false,
            'provided' => array(
                0 => '*',
            ),
        ),
        'psr/http-factory-implementation' => array(
            'dev_requirement' => false,
            'provided' => array(
                0 => '*',
            ),
        ),
        'psr/http-message-implementation' => array(
            'dev_requirement' => false,
            'provided' => array(
                0 => '*',
            ),
        ),
    ),
);
