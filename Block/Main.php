<?php
namespace Loqate\Tag\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Loqate\Tag\Helper\SettingsData;

class Main extends Template
{
    /**
     * @var SettingsData
     */
    protected $pcaSettings;

    /**
     * Main constructor.
     *
     * @param Context      $context
     * @param SettingsData $pcaSettings
     */
    public function __construct(Context $context, SettingsData $pcaSettings)
    {
        $this->pcaSettings = $pcaSettings;

        parent::__construct($context);
    }

    /**
     * @return SettingsData
     */
    public function getSettingsHelper()
    {
        return $this->pcaSettings;
    }
}
