<?php

namespace Loqate\Tag\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\Escaper;
use Magento\Framework\Module\ModuleListInterface;

use Loqate\Tag\Model\SettingsDataFactory;

class SettingsData extends AbstractHelper
{
    /**
     * @var Escaper
     */
    protected $escaper;

    /**
     * @var SettingsDataFactory
     */
    protected $settingsDataFactory;

    /**
     * @var ModuleListInterface
     */
    protected $moduleListInterface;

    /**
     * SettingsData constructor.
     *
     * @param Context $context
     * @param Escaper $escaper
     * @param SettingsDataFactory $settingsDataFactory
     * @param ModuleListInterface $moduleListInterface
     */
    public function __construct(
        Context $context,
        Escaper $escaper,
        SettingsDataFactory $settingsDataFactory,
        ModuleListInterface $moduleListInterface
    ) {
        $this->escaper = $escaper;
        $this->settingsDataFactory = $settingsDataFactory;
        $this->moduleListInterface = $moduleListInterface;
        parent::__construct($context);
    }

    /**
     * @return |null
     */
    public function getId()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['loqate_tag_settingsdata_id'] : null;
    }

    /**
     * @return |null
     */
    public function getAccountCode()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['account_code'] : null;
    }

    /**
     * @return mixed
     */
    public function getModuleVersion()
    {
        return $this->moduleListInterface->getOne("Loqate_Tag")['setup_version'];
    }

    /**
     * @return |null
     */
    public function getAccountToken()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['account_token'] : null;
    }

    /**
     * @return |null
     */
    public function getCustomJavaScriptFront()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['custom_javascript_front'] : null;
    }

    /**
     * @return |null
     */
    public function getCustomJavaScriptBack()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['custom_javascript_back'] : null;
    }

    /**
     * @return |null
     */
    public function getModuleVersionLoggedInOn()
    {
        $lastLogin = $this->getLastLoginRow();
        return $lastLogin != null ? $lastLogin['module_version'] : null;
    }

    /**
     * @param $rowId
     */
    public function deleteRow($rowId)
    {
        $settings = $this->settingsDataFactory->create();
        $item = $settings->load($rowId);
        $item->delete();
    }

    /**
     * @return |null
     */
    private function getLastLoginRow()
    {

        $settings = $this->settingsDataFactory->create();
        $itemCollection = $settings->getCollection();
        $items = $itemCollection->getData();

        $lastCreationTime = null;
        $lastItemRow = null;

        foreach ($items as $item) {
            if ($lastCreationTime == null || $item['creation_time'] > $lastCreationTime) {
                $lastCreationTime = $item['creation_time'];
                $lastItemRow = $item;
            }
        }

        return $lastItemRow;
    }
}
